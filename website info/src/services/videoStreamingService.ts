// Video Streaming Service for managing video uploads, processing, and streaming
export interface VideoUpload {
  id: string;
  filename: string;
  originalSize: number;
  uploadedSize: number;
  status: 'uploading' | 'processing' | 'ready' | 'error' | 'cancelled';
  progress: number; // 0-100
  uploadedAt: Date;
  processingStartedAt?: Date;
  processedAt?: Date;
  errorMessage?: string;
  uploadedBy: string;
  vodClassId?: string;
  sectionId?: string;
}

export interface VideoProcessingJob {
  id: string;
  videoId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: 'uploading' | 'transcoding' | 'thumbnail' | 'optimization' | 'validation';
  estimatedTimeRemaining?: number; // in seconds
  startedAt?: Date;
  completedAt?: Date;
  errorDetails?: string;
}

export interface ProcessedVideo {
  id: string;
  originalVideoId: string;
  filename: string;
  duration: number; // in seconds
  resolution: string;
  bitrate: number;
  format: string;
  size: number;
  quality: 'hd' | 'sd' | 'low';
  streamingUrl: string;
  thumbnailUrl: string;
  downloadUrl?: string;
  isReady: boolean;
}

export interface VideoMetadata {
  id: string;
  title: string;
  description?: string;
  duration: number;
  resolution: string;
  bitrate: number;
  format: string;
  size: number;
  uploadDate: Date;
  instructor: {
    id: string;
    name: string;
  };
  vodClass: {
    id: string;
    title: string;
  };
  section: {
    id: string;
    title: string;
  };
  isPublic: boolean;
  viewCount: number;
  tags: string[];
}

export interface StreamingQuality {
  resolution: string;
  bitrate: number;
  url: string;
  format: string;
}

export interface VideoPlayerConfig {
  autoplay: boolean;
  controls: boolean;
  preload: 'none' | 'metadata' | 'auto';
  allowDownload: boolean;
  allowFullscreen: boolean;
  watermark?: {
    enabled: boolean;
    text: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  qualityOptions: StreamingQuality[];
}

class VideoStreamingService {
  private uploads: VideoUpload[] = [];
  private processingJobs: VideoProcessingJob[] = [];
  private processedVideos: ProcessedVideo[] = [];
  private videoMetadata: VideoMetadata[] = [];

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData() {
    // Mock video uploads
    this.uploads = [
      {
        id: 'upload_001',
        filename: 'stepping_basics_intro.mp4',
        originalSize: 157286400, // ~150MB
        uploadedSize: 157286400,
        status: 'ready',
        progress: 100,
        uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        processedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
        uploadedBy: 'instructor_001',
        vodClassId: 'vod_001',
        sectionId: 'section_001'
      },
      {
        id: 'upload_002',
        filename: 'advanced_footwork_demo.mp4',
        originalSize: 209715200, // ~200MB
        uploadedSize: 125829120, // ~120MB (60% uploaded)
        status: 'uploading',
        progress: 60,
        uploadedAt: new Date(),
        uploadedBy: 'instructor_002',
        vodClassId: 'vod_002',
        sectionId: 'section_002'
      },
      {
        id: 'upload_003',
        filename: 'partner_connection_techniques.mp4',
        originalSize: 104857600, // ~100MB
        uploadedSize: 104857600,
        status: 'processing',
        progress: 85,
        uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        processingStartedAt: new Date(Date.now() - 90 * 60 * 1000),
        uploadedBy: 'instructor_003',
        vodClassId: 'vod_003',
        sectionId: 'section_003'
      }
    ];

    // Mock processing jobs
    this.processingJobs = [
      {
        id: 'job_001',
        videoId: 'upload_001',
        status: 'completed',
        progress: 100,
        currentStep: 'validation',
        startedAt: new Date(Date.now() - 23 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 22 * 60 * 60 * 1000)
      },
      {
        id: 'job_002',
        videoId: 'upload_003',
        status: 'processing',
        progress: 85,
        currentStep: 'optimization',
        estimatedTimeRemaining: 180, // 3 minutes
        startedAt: new Date(Date.now() - 90 * 60 * 1000)
      }
    ];

    // Mock processed videos
    this.processedVideos = [
      {
        id: 'video_001_hd',
        originalVideoId: 'upload_001',
        filename: 'stepping_basics_intro_hd.mp4',
        duration: 720, // 12 minutes
        resolution: '1080p',
        bitrate: 5000,
        format: 'mp4',
        size: 450000000,
        quality: 'hd',
        streamingUrl: '/api/stream/video_001_hd.m3u8',
        thumbnailUrl: '/api/thumbnails/video_001_hd.jpg',
        downloadUrl: '/api/download/video_001_hd.mp4',
        isReady: true
      },
      {
        id: 'video_001_sd',
        originalVideoId: 'upload_001',
        filename: 'stepping_basics_intro_sd.mp4',
        duration: 720,
        resolution: '720p',
        bitrate: 2500,
        format: 'mp4',
        size: 225000000,
        quality: 'sd',
        streamingUrl: '/api/stream/video_001_sd.m3u8',
        thumbnailUrl: '/api/thumbnails/video_001_sd.jpg',
        isReady: true
      }
    ];

    // Mock video metadata
    this.videoMetadata = [
      {
        id: 'video_001',
        title: 'Stepping Basics Introduction',
        description: 'Learn the fundamental steps and timing of Chicago stepping',
        duration: 720,
        resolution: '1080p',
        bitrate: 5000,
        format: 'mp4',
        size: 450000000,
        uploadDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        instructor: {
          id: 'instructor_001',
          name: 'Marcus Johnson'
        },
        vodClass: {
          id: 'vod_001',
          title: 'Complete Beginner Stepping Course'
        },
        section: {
          id: 'section_001',
          title: 'Getting Started'
        },
        isPublic: true,
        viewCount: 245,
        tags: ['beginner', 'basics', 'chicago stepping', 'fundamentals']
      }
    ];
  }

  // Video Upload Management
  async startVideoUpload(
    file: File,
    vodClassId: string,
    sectionId: string,
    uploadedBy: string
  ): Promise<VideoUpload> {
    const upload: VideoUpload = {
      id: `upload_${Date.now()}`,
      filename: file.name,
      originalSize: file.size,
      uploadedSize: 0,
      status: 'uploading',
      progress: 0,
      uploadedAt: new Date(),
      uploadedBy,
      vodClassId,
      sectionId
    };

    this.uploads.push(upload);

    // Simulate upload progress
    this.simulateUploadProgress(upload.id);

    return Promise.resolve(upload);
  }

  private async simulateUploadProgress(uploadId: string) {
    const upload = this.uploads.find(u => u.id === uploadId);
    if (!upload) return;

    const updateInterval = setInterval(() => {
      if (upload.status !== 'uploading') {
        clearInterval(updateInterval);
        return;
      }

      upload.progress += Math.random() * 10;
      upload.uploadedSize = (upload.progress / 100) * upload.originalSize;

      if (upload.progress >= 100) {
        upload.progress = 100;
        upload.uploadedSize = upload.originalSize;
        upload.status = 'processing';
        clearInterval(updateInterval);
        
        // Start processing job
        this.startProcessingJob(upload.id);
      }
    }, 1000);
  }

  async getUploadStatus(uploadId: string): Promise<VideoUpload | null> {
    const upload = this.uploads.find(u => u.id === uploadId);
    return Promise.resolve(upload || null);
  }

  async cancelUpload(uploadId: string): Promise<boolean> {
    const upload = this.uploads.find(u => u.id === uploadId);
    if (!upload || upload.status !== 'uploading') {
      return Promise.resolve(false);
    }

    upload.status = 'cancelled';
    return Promise.resolve(true);
  }

  async getUserUploads(userId: string): Promise<VideoUpload[]> {
    const userUploads = this.uploads.filter(u => u.uploadedBy === userId);
    return Promise.resolve(userUploads);
  }

  // Video Processing Management
  private async startProcessingJob(videoId: string) {
    const job: VideoProcessingJob = {
      id: `job_${Date.now()}`,
      videoId,
      status: 'processing',
      progress: 0,
      currentStep: 'transcoding',
      estimatedTimeRemaining: 600, // 10 minutes
      startedAt: new Date()
    };

    this.processingJobs.push(job);
    this.simulateProcessingProgress(job.id);
  }

  private async simulateProcessingProgress(jobId: string) {
    const job = this.processingJobs.find(j => j.id === jobId);
    if (!job) return;

    const steps: VideoProcessingJob['currentStep'][] = [
      'transcoding', 'thumbnail', 'optimization', 'validation'
    ];
    let currentStepIndex = 0;

    const updateInterval = setInterval(() => {
      if (job.status !== 'processing') {
        clearInterval(updateInterval);
        return;
      }

      job.progress += Math.random() * 5;
      job.estimatedTimeRemaining = Math.max(0, (job.estimatedTimeRemaining || 600) - 30);

      // Move to next step every 25% progress
      const newStepIndex = Math.floor(job.progress / 25);
      if (newStepIndex < steps.length && newStepIndex > currentStepIndex) {
        currentStepIndex = newStepIndex;
        job.currentStep = steps[currentStepIndex];
      }

      if (job.progress >= 100) {
        job.progress = 100;
        job.status = 'completed';
        job.completedAt = new Date();
        job.estimatedTimeRemaining = 0;
        clearInterval(updateInterval);

        // Mark upload as ready
        const upload = this.uploads.find(u => u.id === job.videoId);
        if (upload) {
          upload.status = 'ready';
          upload.processedAt = new Date();
        }

        // Create processed video variants
        this.createProcessedVideoVariants(job.videoId);
      }
    }, 2000);
  }

  private async createProcessedVideoVariants(uploadId: string) {
    const upload = this.uploads.find(u => u.id === uploadId);
    if (!upload) return;

    const baseFilename = upload.filename.replace(/\.[^/.]+$/, '');
    
    // Create HD version
    const hdVideo: ProcessedVideo = {
      id: `${uploadId}_hd`,
      originalVideoId: uploadId,
      filename: `${baseFilename}_hd.mp4`,
      duration: 720 + Math.random() * 600, // Random duration between 12-22 minutes
      resolution: '1080p',
      bitrate: 5000,
      format: 'mp4',
      size: upload.originalSize,
      quality: 'hd',
      streamingUrl: `/api/stream/${uploadId}_hd.m3u8`,
      thumbnailUrl: `/api/thumbnails/${uploadId}_hd.jpg`,
      downloadUrl: `/api/download/${uploadId}_hd.mp4`,
      isReady: true
    };

    // Create SD version
    const sdVideo: ProcessedVideo = {
      id: `${uploadId}_sd`,
      originalVideoId: uploadId,
      filename: `${baseFilename}_sd.mp4`,
      duration: hdVideo.duration,
      resolution: '720p',
      bitrate: 2500,
      format: 'mp4',
      size: Math.floor(upload.originalSize * 0.6),
      quality: 'sd',
      streamingUrl: `/api/stream/${uploadId}_sd.m3u8`,
      thumbnailUrl: `/api/thumbnails/${uploadId}_sd.jpg`,
      isReady: true
    };

    this.processedVideos.push(hdVideo, sdVideo);
  }

  async getProcessingJob(jobId: string): Promise<VideoProcessingJob | null> {
    const job = this.processingJobs.find(j => j.id === jobId);
    return Promise.resolve(job || null);
  }

  async getProcessingJobByVideoId(videoId: string): Promise<VideoProcessingJob | null> {
    const job = this.processingJobs.find(j => j.videoId === videoId);
    return Promise.resolve(job || null);
  }

  // Processed Video Management
  async getProcessedVideos(uploadId: string): Promise<ProcessedVideo[]> {
    const videos = this.processedVideos.filter(v => v.originalVideoId === uploadId);
    return Promise.resolve(videos);
  }

  async getStreamingUrl(videoId: string, quality: 'hd' | 'sd' | 'low' = 'hd'): Promise<string | null> {
    const video = this.processedVideos.find(v => v.id.includes(videoId) && v.quality === quality);
    return Promise.resolve(video?.streamingUrl || null);
  }

  async getThumbnailUrl(videoId: string): Promise<string | null> {
    const video = this.processedVideos.find(v => v.id.includes(videoId));
    return Promise.resolve(video?.thumbnailUrl || null);
  }

  // Video Player Configuration
  async getVideoPlayerConfig(videoId: string, userHasAccess: boolean): Promise<VideoPlayerConfig> {
    const processedVideos = await this.getProcessedVideos(videoId);
    
    const qualityOptions: StreamingQuality[] = processedVideos.map(video => ({
      resolution: video.resolution,
      bitrate: video.bitrate,
      url: video.streamingUrl,
      format: video.format
    }));

    return Promise.resolve({
      autoplay: false,
      controls: true,
      preload: 'metadata',
      allowDownload: userHasAccess,
      allowFullscreen: true,
      watermark: {
        enabled: true,
        text: 'SteppersLife',
        position: 'bottom-right'
      },
      qualityOptions
    });
  }

  // Video Metadata Management
  async updateVideoMetadata(
    videoId: string,
    metadata: Partial<Pick<VideoMetadata, 'title' | 'description' | 'tags' | 'isPublic'>>
  ): Promise<VideoMetadata | null> {
    const video = this.videoMetadata.find(v => v.id === videoId);
    if (!video) {
      return Promise.resolve(null);
    }

    Object.assign(video, metadata);
    return Promise.resolve(video);
  }

  async getVideoMetadata(videoId: string): Promise<VideoMetadata | null> {
    const video = this.videoMetadata.find(v => v.id === videoId);
    return Promise.resolve(video || null);
  }

  async incrementViewCount(videoId: string): Promise<number> {
    const video = this.videoMetadata.find(v => v.id === videoId);
    if (video) {
      video.viewCount += 1;
      return Promise.resolve(video.viewCount);
    }
    return Promise.resolve(0);
  }

  // Storage and Analytics
  async getStorageUsage(instructorId: string): Promise<{
    totalUsed: number; // in bytes
    totalLimit: number; // in bytes
    videoCount: number;
    averageVideoSize: number;
    breakdown: {
      hd: { count: number; size: number };
      sd: { count: number; size: number };
      low: { count: number; size: number };
    };
  }> {
    const instructorUploads = this.uploads.filter(u => u.uploadedBy === instructorId);
    const instructorVideos = this.processedVideos.filter(v => 
      instructorUploads.some(u => u.id === v.originalVideoId)
    );

    const totalUsed = instructorVideos.reduce((sum, video) => sum + video.size, 0);
    const totalLimit = 10 * 1024 * 1024 * 1024; // 10GB limit
    const videoCount = instructorUploads.length;
    const averageVideoSize = videoCount > 0 ? totalUsed / videoCount : 0;

    const breakdown = {
      hd: { count: 0, size: 0 },
      sd: { count: 0, size: 0 },
      low: { count: 0, size: 0 }
    };

    instructorVideos.forEach(video => {
      breakdown[video.quality].count += 1;
      breakdown[video.quality].size += video.size;
    });

    return Promise.resolve({
      totalUsed,
      totalLimit,
      videoCount,
      averageVideoSize,
      breakdown
    });
  }

  async getVideoAnalytics(videoId: string): Promise<{
    viewCount: number;
    totalWatchTime: number;
    averageWatchTime: number;
    completionRate: number;
    qualityDistribution: Record<string, number>;
    viewerLocations: Array<{ country: string; count: number }>;
  }> {
    // Mock analytics data
    const baseViews = Math.floor(Math.random() * 1000) + 100;
    
    return Promise.resolve({
      viewCount: baseViews,
      totalWatchTime: baseViews * 450, // Average 7.5 minutes per view
      averageWatchTime: 450,
      completionRate: 0.72, // 72% completion rate
      qualityDistribution: {
        'hd': 0.65,
        'sd': 0.30,
        'low': 0.05
      },
      viewerLocations: [
        { country: 'United States', count: Math.floor(baseViews * 0.7) },
        { country: 'Canada', count: Math.floor(baseViews * 0.15) },
        { country: 'United Kingdom', count: Math.floor(baseViews * 0.10) },
        { country: 'Other', count: Math.floor(baseViews * 0.05) }
      ]
    });
  }

  // Utility Methods
  async deleteVideo(uploadId: string, instructorId: string): Promise<boolean> {
    const upload = this.uploads.find(u => u.id === uploadId && u.uploadedBy === instructorId);
    if (!upload) {
      return Promise.resolve(false);
    }

    // Remove upload
    this.uploads = this.uploads.filter(u => u.id !== uploadId);
    
    // Remove processing jobs
    this.processingJobs = this.processingJobs.filter(j => j.videoId !== uploadId);
    
    // Remove processed videos
    this.processedVideos = this.processedVideos.filter(v => v.originalVideoId !== uploadId);
    
    // Remove metadata
    this.videoMetadata = this.videoMetadata.filter(v => v.id !== uploadId);

    return Promise.resolve(true);
  }

  async generateDownloadLink(videoId: string, quality: 'hd' | 'sd' | 'low' = 'hd', expiryHours: number = 24): Promise<string> {
    const video = this.processedVideos.find(v => v.id.includes(videoId) && v.quality === quality);
    if (!video || !video.downloadUrl) {
      throw new Error('Video not found or download not available');
    }

    // Generate temporary download link (mock)
    const expiryTime = Date.now() + (expiryHours * 60 * 60 * 1000);
    const token = Math.random().toString(36).substr(2, 9);
    
    return Promise.resolve(`${video.downloadUrl}?token=${token}&expires=${expiryTime}`);
  }
}

export const videoStreamingService = new VideoStreamingService(); 