import { useState, useRef } from "react";
import { Box, IconButton } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import FullscreenImageViewer from "./FullscreenImageViewer";

export default function MediaCarousel({ media, postData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [originRect, setOriginRect] = useState(null);
  const imageRefs = useRef({});

  if (!media || media.length === 0) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const handleDotClick = (index) => {
    setCurrentIndex(index);
  };

  const handleImageClick = (index, event) => {
    const imgElement = event.currentTarget;
    const rect = imgElement.getBoundingClientRect();
    setOriginRect(rect);
    setViewerStartIndex(index);
    setViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setViewerOpen(false);
    setOriginRect(null);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? alpha(t.palette.common.black, 0.4)
            : alpha(t.palette.common.black, 0.02),
        borderRadius: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          paddingTop: "56.25%",
          overflow: "hidden",
        }}
      >
        {media.map((item, index) => (
          <Box
            key={index}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              opacity: currentIndex === index ? 1 : 0,
              transition: "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              pointerEvents: currentIndex === index ? "auto" : "none",
            }}
          >
            {item.type === "video" ? (
              <video
                src={item.url}
                controls
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <img
                ref={(el) => (imageRefs.current[index] = el)}
                src={item.url}
                alt={item.alt || `Media ${index + 1}`}
                onClick={(e) => handleImageClick(index, e)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                }}
              />
            )}
          </Box>
        ))}
      </Box>

      {media.length > 1 && (
        <>
          <IconButton
            onClick={handlePrevious}
            sx={(t) => ({
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: alpha(t.palette.common.black, 0.6),
              color: t.palette.common.white,
              width: 40,
              height: 40,
              backdropFilter: "blur(8px)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: alpha(t.palette.common.black, 0.8),
                transform: "translateY(-50%) scale(1.1)",
              },
              "&:active": {
                transform: "translateY(-50%) scale(0.95)",
              },
            })}
          >
            <ChevronLeft sx={{ fontSize: 28 }} />
          </IconButton>

          <IconButton
            onClick={handleNext}
            sx={(t) => ({
              position: "absolute",
              right: 16,
              top: "50%",
              transform: "translateY(-50%)",
              bgcolor: alpha(t.palette.common.black, 0.6),
              color: t.palette.common.white,
              width: 40,
              height: 40,
              backdropFilter: "blur(8px)",
              transition: "all 0.3s ease",
              "&:hover": {
                bgcolor: alpha(t.palette.common.black, 0.8),
                transform: "translateY(-50%) scale(1.1)",
              },
              "&:active": {
                transform: "translateY(-50%) scale(0.95)",
              },
            })}
          >
            <ChevronRight sx={{ fontSize: 28 }} />
          </IconButton>

          <Box
            sx={{
              position: "absolute",
              bottom: 16,
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: 1,
              bgcolor: alpha("#000", 0.4),
              borderRadius: 3,
              px: 1.5,
              py: 1,
              backdropFilter: "blur(8px)",
            }}
          >
            {media.map((_, index) => (
              <Box
                key={index}
                onClick={() => handleDotClick(index)}
                sx={(t) => ({
                  width: currentIndex === index ? 24 : 8,
                  height: 8,
                  borderRadius: 1,
                  bgcolor:
                    currentIndex === index
                      ? t.palette.common.white
                      : alpha(t.palette.common.white, 0.4),
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: alpha(t.palette.common.white, 0.8),
                  },
                })}
              />
            ))}
          </Box>

          <Box
            sx={(t) => ({
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: alpha(t.palette.common.black, 0.6),
              color: t.palette.common.white,
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 600,
              backdropFilter: "blur(8px)",
            })}
          >
            {currentIndex + 1} / {media.length}
          </Box>
        </>
      )}

      {viewerOpen && (
        <FullscreenImageViewer
          images={media}
          initialIndex={viewerStartIndex}
          onClose={handleCloseViewer}
          originRect={originRect}
        />
      )}
    </Box>
  );
}
