// Always-visible, never-dismissable workflow warning bar.
// Appears directly below the header. role="alert" for accessibility.

export default function WorkflowWarning() {
  return (
    <div
      role="alert"
      className="w-full border-y border-amber-300 bg-amber-50 px-4 py-3 text-amber-900"
    >
      <div className="mx-auto flex max-w-5xl items-start gap-3 text-sm leading-relaxed">
        <span aria-hidden className="mt-0.5 text-base">
          ⚠️
        </span>
        <p>
          <strong>Built for source/HTML view only.</strong> After generating
          code, open your Luminate email in the HTML/source editor — not the
          WYSIWYG visual editor — and paste there. Switching to the visual
          editor after pasting will corrupt your code.
        </p>
      </div>
    </div>
  );
}
