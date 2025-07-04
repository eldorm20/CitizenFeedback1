import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  File, 
  Image, 
  X, 
  AlertCircle, 
  CheckCircle, 
  Video,
  FileText,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedFileTypes?: string[];
  multiple?: boolean;
  disabled?: boolean;
}

interface UploadedFile {
  file: File;
  id: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

export function DragDropUpload({
  onFilesSelected,
  maxFiles = 5,
  maxFileSize = 10,
  acceptedFileTypes = ['image/*', 'video/*', '.pdf', '.doc', '.docx'],
  multiple = true,
  disabled = false
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (file.type.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (file.type === 'application/pdf') return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const getFileSize = (size: number): string => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Файл слишком большой. Максимальный размер: ${maxFileSize}MB`;
    }

    // Check file type
    const isValidType = acceptedFileTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    });

    if (!isValidType) {
      return `Неподдерживаемый тип файла. Разрешены: ${acceptedFileTypes.join(', ')}`;
    }

    // Check total files count
    if (uploadedFiles.length >= maxFiles) {
      return `Максимальное количество файлов: ${maxFiles}`;
    }

    return null;
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Ошибка загрузки",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Add files to upload queue
    const newUploadedFiles = validFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random()}`,
      progress: 0,
      status: 'uploading' as const
    }));

    setUploadedFiles(prev => [...prev, ...newUploadedFiles]);

    // Simulate upload process for each file
    for (const uploadedFile of newUploadedFiles) {
      try {
        await simulateUpload(uploadedFile);
      } catch (error) {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'error', error: 'Ошибка загрузки файла' }
              : f
          )
        );
      }
    }

    // Notify parent component
    onFilesSelected(validFiles);
  };

  const simulateUpload = async (uploadedFile: UploadedFile): Promise<void> => {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, progress: Math.min(progress, 100) }
              : f
          )
        );

        if (progress >= 100) {
          clearInterval(interval);
          setUploadedFiles(prev => 
            prev.map(f => 
              f.id === uploadedFile.id 
                ? { 
                    ...f, 
                    progress: 100, 
                    status: 'completed',
                    url: URL.createObjectURL(uploadedFile.file)
                  }
                : f
            )
          );
          
          toast({
            title: "Файл загружен",
            description: `${uploadedFile.file.name} успешно загружен`,
          });
          resolve();
        }
      }, 100 + Math.random() * 200);

      // Simulate occasional errors
      if (Math.random() < 0.1) {
        setTimeout(() => {
          clearInterval(interval);
          reject(new Error('Simulated upload error'));
        }, 1000);
      }
    });
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter(f => f.id !== id);
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card 
        className={`transition-all duration-200 cursor-pointer ${
          isDragging 
            ? 'border-primary border-dashed border-2 bg-primary/5' 
            : 'border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="flex justify-center">
              <Upload className={`w-12 h-12 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
            
            <div>
              <h3 className="text-lg font-medium">
                {isDragging ? 'Отпустите файлы здесь' : 'Перетащите файлы сюда'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                или нажмите, чтобы выбрать файлы
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline">Макс. {maxFiles} файлов</Badge>
              <Badge variant="outline">До {maxFileSize}MB</Badge>
              <Badge variant="outline">
                {acceptedFileTypes.includes('image/*') && 'Изображения'}
                {acceptedFileTypes.includes('video/*') && ' • Видео'}
                {acceptedFileTypes.includes('.pdf') && ' • PDF'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedFileTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Загруженные файлы ({uploadedFiles.length})</h4>
          
          {uploadedFiles.map((uploadedFile) => (
            <Card key={uploadedFile.id} className="glass-effect">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    {getFileIcon(uploadedFile.file)}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {uploadedFile.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {getFileSize(uploadedFile.file.size)}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {uploadedFile.status === 'uploading' && (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs">{Math.round(uploadedFile.progress)}%</span>
                          </div>
                        )}
                        
                        {uploadedFile.status === 'completed' && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            {uploadedFile.url && uploadedFile.file.type.startsWith('image/') && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(uploadedFile.url, '_blank');
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        )}
                        
                        {uploadedFile.status === 'error' && (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        )}
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(uploadedFile.id);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {uploadedFile.status === 'uploading' && (
                      <Progress value={uploadedFile.progress} className="h-1" />
                    )}
                    
                    {uploadedFile.status === 'error' && uploadedFile.error && (
                      <p className="text-xs text-red-500">{uploadedFile.error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Enhanced Create Post Modal with Drag & Drop
export function EnhancedCreatePostModal({ open, onOpenChange, categories, districts }: any) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleFilesSelected = (files: File[]) => {
    setUploadedFiles(prev => [...prev, ...files]);
  };

  return (
    <div>
      {/* Your existing create post modal content */}
      
      {/* Add the drag-drop component */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Прикрепить файлы</h3>
        <DragDropUpload
          onFilesSelected={handleFilesSelected}
          maxFiles={5}
          maxFileSize={10}
          acceptedFileTypes={['image/*', 'video/*', '.pdf']}
          multiple={true}
        />
      </div>
    </div>
  );
}
