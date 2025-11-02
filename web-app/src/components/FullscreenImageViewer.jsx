import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Box, IconButton, Typography, Menu, MenuItem } from "@mui/material";
import { Close, ChevronLeft, ChevronRight, Download, MoreVert } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const FullscreenImageViewer = ({ 
  images = [], 
  initialIndex = 0, 
  onClose, 
  originRect = null 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [isAnimatingIn, setIsAnimatingIn] = useState(true);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0, time: 0 });
  const [pinchDistance, setPinchDistance] = useState(0);
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  const currentImage = images[currentIndex];

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

    requestAnimationFrame(() => {
      setIsAnimatingIn(false);
    });

    return () => {
      document.documentElement.classList.remove("lightbox-open");
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, []);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleClose();
      if (e.key === "ArrowLeft" && images.length > 1) handlePrevious();
      if (e.key === "ArrowRight" && images.length > 1) handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length]);

  const handleClose = useCallback(() => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      onClose?.();
    }, 180);
  }, [onClose]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(images.length - 1);
    }
  }, [currentIndex, images.length]);

  const handleNext = useCallback(() => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  }, [currentIndex, images.length]);

  const handleWheel = useCallback((e) => {
    if (e.target.closest('.viewer-controls')) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    setScale((prev) => Math.max(1, Math.min(5, prev + delta)));
  }, []);

  const handleMouseDown = useCallback((e) => {
    if (scale > 1 && !e.target.closest('.viewer-controls')) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
      e.preventDefault();
    }
  }, [scale, position]);

  const handleMouseMove = useCallback((e) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, dragStart, scale]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e) => {
    if (e.target.closest('.viewer-controls')) return;

    if (e.touches.length === 1) {
      setTouchStart({
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setPinchDistance(Math.sqrt(dx * dx + dy * dy));
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && pinchDistance > 0) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDistance = Math.sqrt(dx * dx + dy * dy);
      const scaleChange = newDistance / pinchDistance;
      setScale((prev) => Math.max(1, Math.min(5, prev * scaleChange)));
      setPinchDistance(newDistance);
    } else if (e.touches.length === 1 && scale > 1) {
      const deltaX = e.touches[0].clientX - touchStart.x;
      const deltaY = e.touches[0].clientY - touchStart.y;
      setPosition({ x: deltaX, y: deltaY });
    }
  }, [pinchDistance, scale, touchStart]);

  const handleTouchEnd = useCallback((e) => {
    if (e.changedTouches.length === 1 && scale === 1 && images.length > 1) {
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
    setPinchDistance(0);
  }, [touchStart, scale, images.length, handlePrevious, handleNext]);

  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget && scale === 1) {
      handleClose();
    }
  }, [scale, handleClose]);

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  const handleDownload = async () => {
    try {
      const url = typeof currentImage === 'string' ? currentImage : currentImage?.url;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `image-${currentIndex + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
    handleMenuClose();
  };

  const handleViewOriginal = () => {
    const url = typeof currentImage === 'string' ? currentImage : currentImage?.url;
    window.open(url, "_blank");
    handleMenuClose();
  };

  const handleReport = () => {
    alert("This image has been reported for review");
    handleMenuClose();
  };

  const getImageUrl = (img) => {
    return typeof img === 'string' ? img : img?.url || img;
  };

  const getInitialTransform = () => {
    if (!originRect || !isAnimatingIn) return 'scale(1) translate(0, 0)';
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const centerX = viewportWidth / 2;
    const centerY = viewportHeight / 2;
    
    const originCenterX = originRect.left + originRect.width / 2;
    const originCenterY = originRect.top + originRect.height / 2;
    
    const translateX = originCenterX - centerX;
    const translateY = originCenterY - centerY;
    const scaleValue = Math.min(originRect.width / viewportWidth, originRect.height / viewportHeight);
    
    return `translate(${translateX}px, ${translateY}px) scale(${scaleValue})`;
  };

  const getExitTransform = () => {
    if (!originRect || !isAnimatingOut) return 'scale(1) translate(0, 0)';
    return getInitialTransform();
  };

  const lightboxContent = (
    <Box
      ref={containerRef}
      onClick={handleBackdropClick}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      sx={{
        position: "fixed",
        inset: 0,
        bgcolor: alpha("#000", 0.8),
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default",
        opacity: isAnimatingOut ? 0 : 1,
        transition: "opacity 180ms cubic-bezier(0.4, 0, 0.2, 1), background-color 180ms cubic-bezier(0.4, 0, 0.2, 1)",
        userSelect: "none",
        contain: "paint",
        willChange: "transform, opacity",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)",
      }}
    >
      <Box
        className="viewer-controls"
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          gap: 1,
          zIndex: 10,
        }}
      >
        <IconButton
          onClick={handleDownload}
          sx={{
            color: "#fff",
            bgcolor: alpha("#000", 0.4),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha("#fff", 0.1)}`,
            width: 44,
            height: 44,
            "&:hover": {
              bgcolor: alpha("#000", 0.6),
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease",
          }}
          aria-label="Download image"
        >
          <Download sx={{ fontSize: 20 }} />
        </IconButton>

        <IconButton
          onClick={handleMenuOpen}
          sx={{
            color: "#fff",
            bgcolor: alpha("#000", 0.4),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha("#fff", 0.1)}`,
            width: 44,
            height: 44,
            "&:hover": {
              bgcolor: alpha("#000", 0.6),
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease",
          }}
          aria-label="More options"
        >
          <MoreVert sx={{ fontSize: 20 }} />
        </IconButton>

        <IconButton
          onClick={handleClose}
          sx={{
            color: "#fff",
            bgcolor: alpha("#000", 0.4),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha("#fff", 0.1)}`,
            width: 44,
            height: 44,
            "&:hover": {
              bgcolor: alpha("#000", 0.6),
              transform: "scale(1.05)",
            },
            transition: "all 0.2s ease",
          }}
          aria-label="Close viewer"
        >
          <Close sx={{ fontSize: 22 }} />
        </IconButton>
      </Box>

      {images.length > 1 && (
        <Box
          className="viewer-controls"
          sx={{
            position: "absolute",
            top: 16,
            left: 16,
            bgcolor: alpha("#000", 0.4),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha("#fff", 0.1)}`,
            color: "#fff",
            px: 2,
            py: 1,
            borderRadius: 2,
            fontSize: 14,
            fontWeight: 600,
            zIndex: 10,
          }}
        >
          {currentIndex + 1} / {images.length}
        </Box>
      )}

      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: isAnimatingOut 
            ? getExitTransform()
            : isAnimatingIn 
              ? getInitialTransform() 
              : scale > 1 
                ? `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`
                : 'scale(1) translate(0, 0)',
          transition: isAnimatingIn || isAnimatingOut || isDragging
            ? isAnimatingIn || isAnimatingOut
              ? "transform 180ms cubic-bezier(0.4, 0, 0.2, 1)"
              : "none"
            : "transform 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <Box
          ref={imageRef}
          component="img"
          src={getImageUrl(currentImage)}
          alt={`Image ${currentIndex + 1}`}
          draggable={false}
          sx={{
            maxWidth: scale === 1 ? "95vw" : "none",
            maxHeight: scale === 1 ? "95vh" : "none",
            width: scale > 1 ? "auto" : undefined,
            height: scale > 1 ? "auto" : undefined,
            objectFit: "contain",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </Box>

      {images.length > 1 && (
        <>
          <IconButton
            className="viewer-controls"
            onClick={handlePrevious}
            sx={{
              position: "absolute",
              left: { xs: 12, sm: 24 },
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: alpha("#000", 0.4),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha("#fff", 0.1)}`,
              color: "#fff",
              width: { xs: 44, sm: 56 },
              height: { xs: 44, sm: 56 },
              zIndex: 10,
              "&:hover": {
                bgcolor: alpha("#000", 0.6),
                transform: "translateY(-50%) scale(1.08)",
              },
              transition: "all 0.2s ease",
            }}
            aria-label="Previous image"
          >
            <ChevronLeft sx={{ fontSize: { xs: 28, sm: 36 } }} />
          </IconButton>

          <IconButton
            className="viewer-controls"
            onClick={handleNext}
            sx={{
              position: "absolute",
              right: { xs: 12, sm: 24 },
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: alpha("#000", 0.4),
              backdropFilter: "blur(10px)",
              border: `1px solid ${alpha("#fff", 0.1)}`,
              color: "#fff",
              width: { xs: 44, sm: 56 },
              height: { xs: 44, sm: 56 },
              zIndex: 10,
              "&:hover": {
                bgcolor: alpha("#000", 0.6),
                transform: "translateY(-50%) scale(1.08)",
              },
              transition: "all 0.2s ease",
            }}
            aria-label="Next image"
          >
            <ChevronRight sx={{ fontSize: { xs: 28, sm: 36 } }} />
          </IconButton>
        </>
      )}

      {scale > 1 && (
        <Box
          className="viewer-controls"
          sx={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: alpha("#000", 0.4),
            backdropFilter: "blur(10px)",
            border: `1px solid ${alpha("#fff", 0.1)}`,
            color: "#fff",
            px: 2,
            py: 1,
            borderRadius: 2,
            fontSize: 13,
            fontWeight: 600,
            zIndex: 10,
          }}
        >
          {Math.round(scale * 100)}%
        </Box>
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: alpha("#1a1a1a", 0.95),
            backdropFilter: "blur(20px)",
            border: `1px solid ${alpha("#fff", 0.1)}`,
            minWidth: 200,
            mt: 1,
          },
        }}
      >
        <MenuItem
          onClick={handleViewOriginal}
          sx={{
            color: "#fff",
            py: 1.5,
            px: 2,
            fontSize: 14,
            fontWeight: 500,
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
            px: 2,
            fontSize: 14,
            fontWeight: 500,
            "&:hover": { bgcolor: alpha("#fff", 0.1) },
          }}
        >
          Download Image
        </MenuItem>
        <Box sx={{ height: 1, bgcolor: alpha("#fff", 0.1), my: 0.5 }} />
        <MenuItem
          onClick={handleReport}
          sx={{
            color: "#ff6b6b",
            py: 1.5,
            px: 2,
            fontSize: 14,
            fontWeight: 500,
            "&:hover": { bgcolor: alpha("#ff6b6b", 0.1) },
          }}
        >
          Report Image
        </MenuItem>
      </Menu>
    </Box>
  );

  const lightboxRoot = document.getElementById("lightbox-root");
  if (!lightboxRoot) return null;

  return createPortal(lightboxContent, lightboxRoot);
};

export default FullscreenImageViewer;
