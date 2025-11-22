import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  IconButton,
  Avatar,
  Typography,
  Menu,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Close,
  ChevronLeft,
  ChevronRight,
  MoreVert,
  ThumbUpOutlined,
  ChatBubbleOutline,
  Share,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const MediaLightbox = ({ items = [], startIndex = 0, onClose, postData = {} }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState({});
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, time: 0 });
  const [touchDistance, setTouchDistance] = useState(0);
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const closeButtonRef = useRef(null);

  const currentItem = items[currentIndex];

  useEffect(() => {
    const lightboxRoot = document.getElementById("lightbox-root");
    if (!lightboxRoot) {
      const newRoot = document.createElement("div");
      newRoot.id = "lightbox-root";
      document.body.appendChild(newRoot);
    }

    document.documentElement.classList.add("lightbox-open");
    
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalPaddingRight = document.body.style.paddingRight;
    document.body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      document.documentElement.classList.remove("lightbox-open");
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  useEffect(() => {
    if (closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrevious();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, items.length]);

  useEffect(() => {
    const preloadImage = (index) => {
      if (index >= 0 && index < items.length && items[index].type === "image") {
        const img = new Image();
        img.src = items[index].url;
      }
    };

    preloadImage(currentIndex - 1);
    preloadImage(currentIndex + 1);
  }, [currentIndex, items]);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setImageLoaded((prev) => ({ ...prev, [currentIndex]: false }));
  }, [currentIndex]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (items.length > 1) {
      setCurrentIndex(items.length - 1);
    }
  }, [currentIndex, items.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (items.length > 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, items.length]);

  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.2 : 0.2;
      setScale((prev) => Math.max(1, Math.min(4, prev + delta)));
    },
    []
  );

  const handleDoubleClick = useCallback(() => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }, [scale]);

  const handleMouseDown = useCallback(
    (e) => {
      if (scale > 1) {
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      }
    },
    [scale, position]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isDragging && scale > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }
    },
    [isDragging, dragStart, scale]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setTouchDistance(Math.sqrt(dx * dx + dy * dy));
    }
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 2 && touchDistance > 0) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        const scaleChange = newDistance / touchDistance;
        setScale((prev) => Math.max(1, Math.min(4, prev * scaleChange)));
        setTouchDistance(newDistance);
      } else if (e.touches.length === 1 && scale > 1) {
        const deltaX = e.touches[0].clientX - touchStart.x;
        const deltaY = e.touches[0].clientY - touchStart.y;
        setPosition({ x: deltaX, y: deltaY });
      }
    },
    [touchDistance, scale, touchStart]
  );

  const handleTouchEnd = useCallback(
    (e) => {
      if (e.changedTouches.length === 1 && scale === 1) {
        const deltaX = e.changedTouches[0].clientX - touchStart.x;
        const deltaTime = Date.now() - touchStart.time;
        const velocity = Math.abs(deltaX) / deltaTime;

        if (Math.abs(deltaX) > 50 && velocity > 0.3) {
          if (deltaX > 0) {
            handlePrevious();
          } else {
            handleNext();
          }
        }
      }
      setTouchDistance(0);
    },
    [touchStart, scale, handlePrevious, handleNext]
  );

  const handleImageLoad = () => {
    setImageLoaded((prev) => ({ ...prev, [currentIndex]: true }));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleMenuOpen = (e) => {
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleViewOriginal = () => {
    window.open(currentItem.url, "_blank");
    handleMenuClose();
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(currentItem.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
    handleMenuClose();
  };

  const handleReport = () => {
    alert("Report functionality would be implemented here");
    handleMenuClose();
  };

  const lightboxContent = (
    <Box
      role="dialog"
      aria-modal="true"
      aria-label="Media viewer"
      ref={containerRef}
      onClick={handleBackdropClick}
      onWheel={handleWheel}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: alpha("#000", 0.95),
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        animation: "fadeIn 150ms ease-out",
        contain: "paint",
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
        "@keyframes fadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2,
          background: `linear-gradient(180deg, ${alpha("#000", 0.7)} 0%, transparent 100%)`,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            src={postData.avatar}
            sx={{
              width: 40,
              height: 40,
              border: "2px solid rgba(255,255,255,0.2)",
            }}
          >
            {postData.avatarInitials || postData.username?.charAt(0) || "U"}
          </Avatar>
          <Box>
            <Typography sx={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>
              {postData.displayName || postData.username || "User"}
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
              {postData.created || "Recently"}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={handleMenuOpen}
            sx={{
              color: "#fff",
              "&:hover": { bgcolor: alpha("#fff", 0.1) },
            }}
            aria-label="More options"
          >
            <MoreVert />
          </IconButton>
          <IconButton
            ref={closeButtonRef}
            onClick={onClose}
            sx={{
              color: "#fff",
              "&:hover": { bgcolor: alpha("#fff", 0.1) },
            }}
            aria-label="Close viewer"
          >
            <Close />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
        }}
      >
        {!imageLoaded[currentIndex] && (
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <CircularProgress sx={{ color: "#fff" }} />
          </Box>
        )}

        {currentItem?.type === "image" && (
          <Box
            ref={imageRef}
            component="img"
            src={currentItem.url}
            alt={currentItem.alt || `Image ${currentIndex + 1}`}
            onLoad={handleImageLoad}
            onMouseDown={handleMouseDown}
            onDoubleClick={handleDoubleClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            draggable={false}
            sx={{
              maxWidth: scale === 1 ? "90vw" : "none",
              maxHeight: scale === 1 ? "calc(100vh - 200px)" : "none",
              objectFit: "contain",
              transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
              transition: isDragging ? "none" : "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)",
              userSelect: "none",
              opacity: imageLoaded[currentIndex] ? 1 : 0,
              filter: imageLoaded[currentIndex] ? "none" : "blur(20px)",
              animation: imageLoaded[currentIndex] ? "scaleIn 180ms ease-out" : "none",
              "@keyframes scaleIn": {
                from: { opacity: 0, transform: "scale(0.9)" },
                to: { opacity: 1, transform: "scale(1)" },
              },
            }}
          />
        )}

        {currentItem?.type === "video" && (
          <Box
            component="video"
            src={currentItem.url}
            controls
            autoPlay
            sx={{
              maxWidth: "90vw",
              maxHeight: "calc(100vh - 200px)",
              objectFit: "contain",
            }}
          />
        )}
      </Box>

      {items.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: "absolute",
              left: { xs: 8, sm: 24 },
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: alpha("#000", 0.5),
              color: "#fff",
              width: { xs: 40, sm: 56 },
              height: { xs: 40, sm: 56 },
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              "&:hover": {
                bgcolor: alpha("#000", 0.7),
                transform: "translateY(-50%) scale(1.1)",
              },
              transition: "all 0.2s ease",
            }}
            aria-label="Previous image"
          >
            <ChevronLeft sx={{ fontSize: { xs: 28, sm: 36 } }} />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: { xs: 8, sm: 24 },
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: alpha("#000", 0.5),
              color: "#fff",
              width: { xs: 40, sm: 56 },
              height: { xs: 40, sm: 56 },
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.1)",
              "&:hover": {
                bgcolor: alpha("#000", 0.7),
                transform: "translateY(-50%) scale(1.1)",
              },
              transition: "all 0.2s ease",
            }}
            aria-label="Next image"
          >
            <ChevronRight sx={{ fontSize: { xs: 28, sm: 36 } }} />
          </IconButton>
        </>
      )}

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          background: `linear-gradient(0deg, ${alpha("#000", 0.8)} 0%, transparent 100%)`,
          p: 2,
          pb: { xs: 3, sm: 2 },
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "center", sm: "flex-start" },
            justifyContent: "space-between",
            gap: 2,
            maxWidth: "1200px",
            mx: "auto",
          }}
        >
          <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
            {items.length > 1 && (
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  mb: 0.5,
                }}
              >
                {currentIndex + 1} of {items.length}
              </Typography>
            )}
            {postData.content && (
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontSize: 15,
                  lineHeight: 1.5,
                  maxWidth: "600px",
                }}
              >
                {postData.content}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: { xs: 2, sm: 1 },
              alignItems: "center",
            }}
          >
            <IconButton
              sx={{
                color: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: alpha("#fff", 0.1), color: "#fff" },
                flexDirection: "column",
                gap: 0.5,
              }}
              aria-label="Like"
            >
              <ThumbUpOutlined sx={{ fontSize: 22 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Like</Typography>
            </IconButton>
            <IconButton
              sx={{
                color: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: alpha("#fff", 0.1), color: "#fff" },
                flexDirection: "column",
                gap: 0.5,
              }}
              aria-label="Comment"
            >
              <ChatBubbleOutline sx={{ fontSize: 22 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Comment</Typography>
            </IconButton>
            <IconButton
              sx={{
                color: "rgba(255,255,255,0.9)",
                "&:hover": { bgcolor: alpha("#fff", 0.1), color: "#fff" },
                flexDirection: "column",
                gap: 0.5,
              }}
              aria-label="Share"
            >
              <Share sx={{ fontSize: 22 }} />
              <Typography sx={{ fontSize: 11, fontWeight: 600 }}>Share</Typography>
            </IconButton>
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: alpha("#1a1a1a", 0.95),
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.1)",
            minWidth: 200,
          },
        }}
      >
        <MenuItem
          onClick={handleViewOriginal}
          sx={{
            color: "#fff",
            py: 1.5,
            fontSize: 14,
            "&:hover": { bgcolor: alpha("#fff", 0.1) },
          }}
        >
          View Original
        </MenuItem>
        <MenuItem
          onClick={handleDownload}
          sx={{
            color: "#fff",
            py: 1.5,
            fontSize: 14,
            "&:hover": { bgcolor: alpha("#fff", 0.1) },
          }}
        >
          Download
        </MenuItem>
        <MenuItem
          onClick={handleReport}
          sx={{
            color: "#ff6b6b",
            py: 1.5,
            fontSize: 14,
            "&:hover": { bgcolor: alpha("#ff6b6b", 0.1) },
          }}
        >
          Report
        </MenuItem>
      </Menu>
    </Box>
  );

  const lightboxRoot = document.getElementById("lightbox-root");
  if (!lightboxRoot) return null;

  return createPortal(lightboxContent, lightboxRoot);
};

export default MediaLightbox;
