# Backup Demo Video Location

Place your `demo-video.mp4` file in this directory.

The video will be accessible at `/backup/demo-video.mp4` in the application.

## Video Requirements

- **Format**: MP4 (H.264 codec recommended)
- **Maximum Duration**: 10 minutes
- **Recommended Resolution**: 1080p or 720p
- **Recommended Bitrate**: 2-5 Mbps
- **Audio**: AAC codec, 128-192 kbps

## Quick Recording Tips

1. Use OBS Studio, Loom, or similar screen recording software
2. Record at 1080p resolution
3. Ensure audio is clear
4. Keep file size reasonable (< 500MB recommended)
5. Test playback before demo day

## File Placement

```
public/
  └── backup/
      ├── README.md (this file)
      └── demo-video.mp4 (place your video here)
```

The video will be served from: `http://localhost:3000/backup/demo-video.mp4`
