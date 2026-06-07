import { Color } from '@tiptap/extension-color';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { useEffect } from 'react';

interface Props {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
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

export default function TipTapEditor({ value, onChange, placeholder }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [1, 2, 3] },
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
            },
        },
    });

    // Sync external value changes (e.g. after save/reload)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value, false);
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
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
            </div>

            {/* Editor area */}
            <EditorContent editor={editor} />
        </div>
    );
}
