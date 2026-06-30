import { Color } from '@tiptap/extension-color';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useEffect, useRef, useState } from 'react';

const MAX_IMAGE_WIDTH = 1920;
const MAX_IMAGE_HEIGHT = 1920;
const TARGET_IMAGE_BYTES = 1_400_000;
const MIN_QUALITY = 0.55;

function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    const objectUrl = URL.createObjectURL(file);

    try {
        const image = await new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new window.Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Afbeelding kon niet geladen worden.'));
            img.src = objectUrl;
        });

        return image;
    } finally {
        URL.revokeObjectURL(objectUrl);
    }
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

    if (!blob) {
        throw new Error('Afbeelding kon niet geconverteerd worden.');
    }

    return blob;
}

async function compressImage(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) {
        return file;
    }

    const img = await loadImageFromFile(file);
    const scale = Math.min(1, MAX_IMAGE_WIDTH / img.width, MAX_IMAGE_HEIGHT / img.height);
    const targetWidth = Math.max(1, Math.round(img.width * scale));
    const targetHeight = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext('2d');
    if (!context) {
        return file;
    }

    context.drawImage(img, 0, 0, targetWidth, targetHeight);

    const outputType = file.type === 'image/png' ? 'image/webp' : file.type || 'image/jpeg';
    let quality = 0.86;
    let blob = await canvasToBlob(canvas, outputType, quality);

    while (blob.size > TARGET_IMAGE_BYTES && quality > MIN_QUALITY) {
        quality -= 0.08;
        blob = await canvasToBlob(canvas, outputType, quality);
    }

    if (blob.size >= file.size) {
        return file;
    }

    const extension = outputType === 'image/webp' ? 'webp' : outputType === 'image/png' ? 'png' : 'jpg';
    const baseName = file.name.replace(/\.[^.]+$/, '');

    return new File([blob], `${baseName}.${extension}`, {
        type: outputType,
        lastModified: Date.now(),
    });
}

interface Props {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    spellCheck?: boolean;
    language?: string;
    imageUploadUrl?: string;
}

function ToolbarBtn({
    onClick,
    active,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <button
            type="button"
            onMouseDown={(e) => {
                e.preventDefault();
                onClick();
            }}
            title={title}
            className={`px-2 py-1.5 rounded text-sm transition-colors ${
                active
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
        >
            {children}
        </button>
    );
}

function ImageInsertIcon() {
    return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" focusable="false">
            <path
                d="M4.5 5.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-13Zm2 .5a1 1 0 0 0-1 1v9.2l3.7-3.7a1 1 0 0 1 1.4 0l2.4 2.4 1.8-1.8a1 1 0 0 1 1.4 0l2.3 2.3V7a1 1 0 0 0-1-1h-11Zm9.8 12.5H6.5a1 1 0 0 1-1-1v-.2l4.4-4.4 2.4 2.4a1 1 0 0 0 1.4 0l1.8-1.8 2 2v2a1 1 0 0 1-1 1ZM8.8 10.2a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"
                fill="currentColor"
            />
        </svg>
    );
}

function ImageResizeMenu({ editor }: { editor: ReturnType<typeof useEditor> | null }) {
    const [imageRect, setImageRect] = useState<DOMRect | null>(null);
    const [selectedImageNode, setSelectedImageNode] = useState<any>(null);
    const [selectedImageElement, setSelectedImageElement] = useState<HTMLImageElement | null>(null);
    const [isResizing, setIsResizing] = useState(false);
    const resizeStartData = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

    useEffect(() => {
        if (!editor || isResizing) return;

        const updateImageSelection = () => {
            const { selection } = editor.state;
            const node = selection.$anchor.nodeBefore || selection.$anchor.nodeAfter;

            if (node && node.type.name === 'image') {
                setSelectedImageNode(node);
                
                // Zoek de img in de editor DOM
                const editorDOM = document.querySelector('[data-testid="editor-content"], .ProseMirror, [contenteditable="true"]');
                if (editorDOM) {
                    const images = editorDOM.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
                    if (images.length > 0) {
                        // Neem de laatste geselecteerde image (meest waarschijnlijk de huidige)
                        const imgElement = images[images.length - 1];
                        setSelectedImageElement(imgElement);
                        setImageRect(imgElement.getBoundingClientRect());
                    }
                }
            } else {
                setSelectedImageNode(null);
                setSelectedImageElement(null);
                setImageRect(null);
            }
        };

        editor.on('selectionUpdate', updateImageSelection);
        editor.on('update', updateImageSelection);

        const handleScroll = () => {
            if (selectedImageElement) {
                setImageRect(selectedImageElement.getBoundingClientRect());
            }
        };
        
        window.addEventListener('scroll', handleScroll);

        return () => {
            editor.off('selectionUpdate', updateImageSelection);
            editor.off('update', updateImageSelection);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [editor, selectedImageElement, isResizing]);

    const handleResizeStart = (e: React.MouseEvent, handle: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!selectedImageNode || !imageRect || !selectedImageElement || !editor) return;

        const currentWidth = parseInt(selectedImageNode.attrs.width || String(selectedImageElement.width), 10);
        const currentHeight = parseInt(selectedImageNode.attrs.height || String(selectedImageElement.height), 10);

        resizeStartData.current = {
            startX: e.clientX,
            startY: e.clientY,
            startWidth: currentWidth,
            startHeight: currentHeight,
        };

        setIsResizing(true);

        const handleMouseMove = (moveEvent: MouseEvent) => {
            if (!resizeStartData.current || !editor) return;

            const deltaX = moveEvent.clientX - resizeStartData.current.startX;
            const deltaY = moveEvent.clientY - resizeStartData.current.startY;

            let newWidth = resizeStartData.current.startWidth;
            let newHeight = resizeStartData.current.startHeight;

            if (handle.includes('right')) {
                newWidth = Math.max(50, resizeStartData.current.startWidth + deltaX);
            }
            if (handle.includes('left')) {
                newWidth = Math.max(50, resizeStartData.current.startWidth - deltaX);
            }
            if (handle.includes('bottom')) {
                newHeight = Math.max(50, resizeStartData.current.startHeight + deltaY);
            }
            if (handle.includes('top')) {
                newHeight = Math.max(50, resizeStartData.current.startHeight - deltaY);
            }

            // Update with local state instead of triggering full editor update
            if (selectedImageElement) {
                selectedImageElement.style.width = `${newWidth}px`;
                selectedImageElement.style.height = `${newHeight}px`;
            }

            setImageRect(imageRect ? new DOMRect(imageRect.left, imageRect.top, newWidth, imageRect.height * (newWidth / imageRect.width), 0) : null);

            editor.chain().updateAttributes('image', { width: newWidth, height: newHeight }).run();
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            resizeStartData.current = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    if (!imageRect || !selectedImageNode || isResizing === null) return null;

    return (
        <div
            className="fixed z-40 pointer-events-none border-2 border-blue-400"
            style={{
                left: `${imageRect.left}px`,
                top: `${imageRect.top}px`,
                width: `${imageRect.width}px`,
                height: `${imageRect.height}px`,
            }}
        >
            {/* Corner handles */}
            <div
                onMouseDown={(e) => handleResizeStart(e, 'top-left')}
                className="absolute -top-2 -left-2 w-4 h-4 bg-blue-500 border border-white rounded-full cursor-nwse-resize pointer-events-auto hover:bg-blue-600 shadow-md"
            />
            <div
                onMouseDown={(e) => handleResizeStart(e, 'top-right')}
                className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 border border-white rounded-full cursor-nesw-resize pointer-events-auto hover:bg-blue-600 shadow-md"
            />
            <div
                onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
                className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-500 border border-white rounded-full cursor-nesw-resize pointer-events-auto hover:bg-blue-600 shadow-md"
            />
            <div
                onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
                className="absolute -bottom-2 -right-2 w-4 h-4 bg-blue-500 border border-white rounded-full cursor-nwse-resize pointer-events-auto hover:bg-blue-600 shadow-md"
            />

            {/* Side handles */}
            <div
                onMouseDown={(e) => handleResizeStart(e, 'top')}
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 cursor-ns-resize pointer-events-auto"
            />
            <div
                onMouseDown={(e) => handleResizeStart(e, 'bottom')}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 cursor-ns-resize pointer-events-auto"
            />
            <div
                onMouseDown={(e) => handleResizeStart(e, 'left')}
                className="absolute top-1/2 -translate-y-1/2 -left-2 h-8 w-4 cursor-ew-resize pointer-events-auto"
            />
            <div
                onMouseDown={(e) => handleResizeStart(e, 'right')}
                className="absolute top-1/2 -translate-y-1/2 -right-2 h-8 w-4 cursor-ew-resize pointer-events-auto"
            />
        </div>
    );
}

export default function TipTapEditor({
    value,
    onChange,
    placeholder,
    spellCheck = true,
    language = 'nl',
    imageUploadUrl,
}: Props) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [compressProgress, setCompressProgress] = useState<number | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-lg my-3 max-w-full h-auto cursor-pointer',
                    loading: 'lazy',
                },
                inline: false,
            }),
            Underline,
            TextStyle,
            Color,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: { class: 'text-orange-500 underline' },
            }),
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Placeholder.configure({
                placeholder: placeholder ?? 'Begin hier met typen...',
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none min-h-[320px] px-5 py-4',
                spellcheck: spellCheck ? 'true' : 'false',
                lang: language,
                autocorrect: 'on',
                autocapitalize: 'sentences',
            },
        },
    });

    // Sync external value changes (e.g. after save/reload)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, false);
        }
    }, [value, editor]);

    async function uploadInlineImage(file: File) {
        if (!imageUploadUrl) {
            return;
        }

        setUploadError(null);
        setCompressProgress(0);
        setUploadProgress(0);

        let fileToUpload = file;

        try {
            fileToUpload = await compressImage(file);
        } catch {
            fileToUpload = file;
        }

        setCompressProgress(100);

        const formData = new FormData();
        formData.append('photo', fileToUpload);
        formData.append('_token', getCsrfToken());

        const xhr = new XMLHttpRequest();
        xhr.open('POST', imageUploadUrl, true);
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                setUploadProgress(Math.round((event.loaded / event.total) * 100));
            }
        };

        xhr.onload = () => {
            try {
                if (xhr.status < 200 || xhr.status >= 300) {
                    throw new Error('Upload mislukt');
                }

                const payload = JSON.parse(xhr.responseText) as { url?: string };

                if (!payload.url) {
                    throw new Error('Geen afbeeldings-URL ontvangen');
                }

                editor?.chain().focus().setImage({ src: payload.url, alt: file.name }).run();
                setUploadProgress(100);
                setTimeout(() => {
                    setCompressProgress(null);
                    setUploadProgress(null);
                }, 600);
            } catch {
                setUploadError('Uploaden van afbeelding is mislukt.');
                setCompressProgress(null);
                setUploadProgress(null);
            }
        };

        xhr.onerror = () => {
            setUploadError('Uploaden van afbeelding is mislukt.');
            setCompressProgress(null);
            setUploadProgress(null);
        };

        xhr.send(formData);
    }

    function onPickImageFile(files: FileList | null) {
        if (!files || files.length === 0) {
            return;
        }

        uploadInlineImage(files[0]);
    }

    if (!editor) return null;

    return (
        <div className="rounded-xl border border-gray-300 bg-white">
            {/* Toolbar */}
            <div className="sticky top-4 z-20 rounded-t-xl border-b border-gray-200 bg-gray-50/95 shadow-sm backdrop-blur">
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5">
                {/* Headings */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    active={editor.isActive('heading', { level: 1 })}
                    title="Kop 1"
                >
                    H1
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor.isActive('heading', { level: 2 })}
                    title="Kop 2"
                >
                    H2
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor.isActive('heading', { level: 3 })}
                    title="Kop 3"
                >
                    H3
                </ToolbarBtn>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Inline styles */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    active={editor.isActive('bold')}
                    title="Vet (Ctrl+B)"
                >
                    <strong>B</strong>
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    active={editor.isActive('italic')}
                    title="Cursief (Ctrl+I)"
                >
                    <em>I</em>
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    active={editor.isActive('underline')}
                    title="Onderstrepen (Ctrl+U)"
                >
                    <span className="underline">U</span>
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    active={editor.isActive('strike')}
                    title="Doorstrepen"
                >
                    <span className="line-through">S</span>
                </ToolbarBtn>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Lists */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    active={editor.isActive('bulletList')}
                    title="Opsomming"
                >
                    ≡
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    active={editor.isActive('orderedList')}
                    title="Genummerde lijst"
                >
                    1.
                </ToolbarBtn>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Alignment */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    active={editor.isActive({ textAlign: 'left' })}
                    title="Links uitlijnen"
                >
                    ◁
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    active={editor.isActive({ textAlign: 'center' })}
                    title="Centreren"
                >
                    ≡
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    active={editor.isActive({ textAlign: 'right' })}
                    title="Rechts uitlijnen"
                >
                    ▷
                </ToolbarBtn>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Block */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    active={editor.isActive('blockquote')}
                    title="Citaat"
                >
                    "
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    active={false}
                    title="Horizontale lijn"
                >
                    —
                </ToolbarBtn>

                <div className="w-px h-5 bg-gray-200 mx-1" />

                {/* Undo/Redo */}
                <ToolbarBtn
                    onClick={() => editor.chain().focus().undo().run()}
                    active={false}
                    title="Ongedaan maken (Ctrl+Z)"
                >
                    ↩
                </ToolbarBtn>
                <ToolbarBtn
                    onClick={() => editor.chain().focus().redo().run()}
                    active={false}
                    title="Opnieuw (Ctrl+Y)"
                >
                    ↪
                </ToolbarBtn>

                {imageUploadUrl && (
                    <>
                        <div className="w-px h-5 bg-gray-200 mx-1" />
                        <ToolbarBtn
                            onClick={() => fileInputRef.current?.click()}
                            active={false}
                            title="Afbeelding invoegen"
                        >
                            <span className="inline-flex items-center">
                                <ImageInsertIcon />
                            </span>
                        </ToolbarBtn>
                    </>
                )}
                </div>
            </div>

            {imageUploadUrl && (
                <div className="sticky top-13 z-10 border-b border-gray-200 bg-white/95 px-3 py-2 backdrop-blur">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/webp"
                        onChange={(e) => {
                            onPickImageFile(e.target.files);
                            e.currentTarget.value = '';
                        }}
                        className="hidden"
                    />

                    {(compressProgress !== null || uploadProgress !== null) && (
                        <div className="space-y-2 text-xs text-gray-600">
                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <span>Afbeelding verkleinen</span>
                                    <span>{compressProgress ?? 0}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-gray-200">
                                    <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${compressProgress ?? 0}%` }} />
                                </div>
                            </div>

                            <div>
                                <div className="mb-1 flex items-center justify-between">
                                    <span>Uploaden</span>
                                    <span>{uploadProgress ?? 0}%</span>
                                </div>
                                <div className="h-1.5 rounded-full bg-gray-200">
                                    <div className="h-1.5 rounded-full bg-emerald-500 transition-all" style={{ width: `${uploadProgress ?? 0}%` }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
                </div>
            )}

            {/* Editor area */}
            <EditorContent editor={editor} />
            <ImageResizeMenu editor={editor} />
        </div>
    );
}
