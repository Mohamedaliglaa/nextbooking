// components/ui/FileInput.tsx
'use client';

import { useId, useRef, useState } from 'react';
import { Button } from './button';
import { X, UploadCloud, File as FileIcon } from 'lucide-react';
import clsx from 'clsx';

type SingleOrMultiple<T> = T | T[];

interface BaseProps {
  label?: string;
  accept?: string;
  multiple?: boolean;         // default false
  disabled?: boolean;
  className?: string;
  /**
   * If multiple=false (default): onChange(File | null)
   * If multiple=true: onChange(File[] | null)
   */
  onChange: (file: SingleOrMultiple<File> | null) => void;
}

export function FileInput({
  label = 'Choisir un fichier',
  accept = 'image/*',
  multiple = false,
  disabled,
  className,
  onChange,
}: BaseProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selected, setSelected] = useState<File[] | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const openPicker = () => {
    inputRef.current?.click();
  };

  const clear = () => {
    setSelected(null);
    if (inputRef.current) {
      inputRef.current.value = ''; // reset the native input
    }
    onChange(null);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) {
      onChange(null);
      setSelected(null);
      return;
    }
    const arr = Array.from(files);
    setSelected(arr);
    onChange(multiple ? arr : arr[0]);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    handleFiles(e.dataTransfer?.files ?? null);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const hasSelection = !!selected?.length;

  return (
    <div className={clsx('w-full', className)}>
      {/* Hidden input that actually opens the system picker */}
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={onInputChange}
        className="hidden"
      />

      {/* Dropzone + button */}
      <div
        onClick={openPicker}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={clsx(
          'group cursor-pointer rounded-lg border border-dashed p-4 transition',
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent/40'
        )}
        role="button"
        aria-label={label}
      >
        <div className="flex items-center gap-3">
          <UploadCloud className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">Glissez-déposez ou cliquez pour importer</p>
          </div>
          <Button type="button" variant="secondary" onClick={openPicker} disabled={disabled}>
            Parcourir
          </Button>
        </div>
      </div>

      {/* Selected files preview (name only; preview thumbnails are shown in your page) */}
      {hasSelection && (
        <div className="mt-2 rounded-md border p-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {selected!.map((f, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 rounded bg-accent px-2 py-1 text-xs text-foreground"
                >
                  <FileIcon className="h-3 w-3" />
                  {f.name}
                </span>
              ))}
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={clear}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
