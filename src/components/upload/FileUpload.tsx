'use client';

import React, { useCallback, useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  isProcessing: boolean;
  acceptedTypes?: string;
}

export function FileUpload({ onFileSelected, isProcessing, acceptedTypes = '.xlsx,.csv,.xls' }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        setSelectedFile(file);
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        setSelectedFile(file);
        onFileSelected(file);
      }
    },
    [onFileSelected]
  );

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-dropzone ${isDragging ? 'dragging' : ''} ${isProcessing ? 'processing' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes}
          onChange={handleFileChange}
          className="upload-input"
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="upload-processing">
            <div className="spinner" />
            <p>Processing file...</p>
          </div>
        ) : selectedFile ? (
          <div className="upload-selected">
            <span className="upload-file-icon">📄</span>
            <p className="upload-file-name">{selectedFile.name}</p>
            <p className="upload-file-size">{formatSize(selectedFile.size)}</p>
            <p className="upload-hint">Click or drop to replace</p>
          </div>
        ) : (
          <div className="upload-empty">
            <span className="upload-cloud-icon">☁️</span>
            <p className="upload-title">Drop your file here</p>
            <p className="upload-subtitle">or click to browse</p>
            <p className="upload-formats">Supports: XLSX, CSV, XLS</p>
          </div>
        )}
      </div>
    </div>
  );
}
