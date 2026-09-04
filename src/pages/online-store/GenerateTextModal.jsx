import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, RefreshCw } from 'lucide-react';
import { Popup } from '../../ce-ui';
import { useSnackbar } from '../../contexts/SnackbarContext';

/**
 * Deterministic stand-in for a real Labamu AI call — there is no AI backend
 * wired into this demo, so generation is simulated locally (same philosophy
 * as this app's other "Simulate Event" style features). Typing "fail" or
 * "unavailable" into the prompt is a deliberate escape hatch for exercising
 * the PRD's negative/edge states without a real failing backend.
 */
function simulateGeneration(mode, prompt) {
  const trimmed = prompt.trim();
  const lower = trimmed.toLowerCase();
  if (lower.includes('unavailable')) return { status: 'unavailable' };
  if (lower.includes('fail')) return { status: 'error' };

  if (mode === 'title') {
    const title = trimmed.replace(/\s+/g, ' ');
    return {
      status: 'ok',
      text: title.charAt(0).toUpperCase() + title.slice(1),
    };
  }

  const text = `<p>${trimmed.charAt(0).toUpperCase() + trimmed.slice(1)}. Here's a draft paragraph generated from your prompt — feel free to edit it before publishing.</p><p>It highlights what makes this worth a customer's attention, in a friendly, on-brand tone.</p>`;
  return { status: 'ok', text };
}

/**
 * Shared "Generate text" dialog for both the Title field and the Content
 * editor (Rich Text Editor — Generate Text with AI), built on ce-ui's
 * shared `Popup`. `mode` controls the copy and the shape of the simulated
 * output; `hasExisting` surfaces the content-editor-only "replace or insert
 * alongside" edge case via Popup's secondary action slot.
 *
 * `simulateGenFail`/`simulateUnavailable` are controlled by the caller (the
 * PageEditor's single Simulate panel) rather than owned here, so the AI
 * simulation toggles surface alongside its other simulate options instead of
 * a separate checkbox row inside this modal — the "type fail/unavailable in
 * the prompt" convention above keeps working side by side either way.
 */
export default function GenerateTextModal({
  open,
  mode,
  hasExisting,
  onClose,
  onApply,
  simulateGenFail = false,
  simulateUnavailable = false,
}) {
  const { t } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | ok | error | unavailable
  const [result, setResult] = useState(null);

  const reset = () => {
    setPrompt('');
    setState('idle');
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setState('loading');
    setTimeout(() => {
      const outcome = simulateGenFail
        ? { status: 'error' }
        : simulateUnavailable
        ? { status: 'unavailable' }
        : simulateGeneration(mode, prompt);

      if (outcome.status === 'error') {
        setState('idle');
        showSnackbar(t('sectionBuilder:onlineStore.pageEditor.generateError', 'Failed to generate content'), 'red');
        return;
      }
      if (outcome.status === 'unavailable') {
        setState('idle');
        showSnackbar(
          t('sectionBuilder:onlineStore.pageEditor.generateUnavailable', 'AI generation is currently unavailable'),
          'red'
        );
        return;
      }

      setResult(outcome.text);
      setState('ok');
    }, 500);
  };

  const applyText = (insertMode) => {
    onApply(result, insertMode);
    handleClose();
  };

  const showingResult = state === 'ok' && result;
  const canOfferBoth = mode === 'content' && hasExisting;

  return (
    <Popup
      open={open}
      onClose={handleClose}
      platform="tablet"
      align="left"
      title={
        mode === 'title'
          ? t('sectionBuilder:onlineStore.pageEditor.generateTitleHeading', 'Generate a title with Labamu AI')
          : t('sectionBuilder:onlineStore.pageEditor.generateContentHeading', 'Generate content with Labamu AI')
      }
      primaryAction={
        showingResult
          ? {
              label: canOfferBoth
                ? t('sectionBuilder:onlineStore.pageEditor.generateReplace', 'Replace content')
                : t('sectionBuilder:onlineStore.pageEditor.generateUse', 'Use this text'),
              onClick: () => applyText('replace'),
            }
          : {
              label:
                state === 'loading'
                  ? t('sectionBuilder:onlineStore.pageEditor.generating', 'Generating…')
                  : t('sectionBuilder:onlineStore.pageEditor.generate', 'Generate'),
              onClick: handleGenerate,
              disabled: !prompt.trim() || state === 'loading',
              loading: state === 'loading',
            }
      }
      secondaryAction={
        showingResult && canOfferBoth
          ? {
              label: t('sectionBuilder:onlineStore.pageEditor.generateInsert', 'Insert alongside'),
              onClick: () => applyText('insert'),
            }
          : undefined
      }
    >
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-xs font-medium text-lb-on-surface-2">
          {t('sectionBuilder:onlineStore.pageEditor.generatePromptLabel', 'Describe what you want')}
        </label>
        {/* Regenerate — only once a result exists, right where Insert
            alongside/Replace would otherwise be the only way back to
            generation. Re-runs with the same prompt still sitting in the
            textarea below rather than clearing it, so there's nothing to
            retype for another pass. */}
        {showingResult && (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={state === 'loading'}
            className="flex items-center gap-1 text-xs font-medium text-[#8A3FFC] hover:underline disabled:opacity-50"
          >
            <RefreshCw size={12} />
            {t('sectionBuilder:onlineStore.pageEditor.generateRegenerate', 'Regenerate')}
          </button>
        )}
      </div>
      <textarea
        autoFocus
        rows={3}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={
          mode === 'title'
            ? t('sectionBuilder:onlineStore.pageEditor.generateTitlePlaceholder', 'e.g. A warm about-us page for a family bakery')
            : t('sectionBuilder:onlineStore.pageEditor.generateContentPlaceholder', 'e.g. Explain our shipping and return policy')
        }
        className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-[#006BFF]"
      />

      {showingResult && (
        <div className="mt-3">
          <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-gray-800">
            <Sparkles size={12} />
            {t('sectionBuilder:onlineStore.pageEditor.generateResultLabel', 'Labamu AI generated')}
          </span>
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
            {mode === 'title' ? result : <div dangerouslySetInnerHTML={{ __html: result }} />}
          </div>
        </div>
      )}
    </Popup>
  );
}
