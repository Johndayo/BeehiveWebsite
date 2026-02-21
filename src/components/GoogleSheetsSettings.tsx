import { useState, useEffect } from 'react';
import { FileSpreadsheet, Save, Loader2, CheckCircle, ExternalLink, AlertCircle, Copy, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

const APPS_SCRIPT_CODE = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      'Timestamp', 'Organization', 'Industry', 'Country', 'Website',
      'Employees', 'Service Areas', 'Key Challenge', 'Desired Outcome',
      'Reform Context', 'Start Date', 'Timeline', 'Budget Approved',
      'Contact Name', 'Contact Email', 'Contact Phone', 'Contact Role',
      'Approvers', 'Partners'
    ]);
  }

  sheet.appendRow([
    new Date().toISOString(),
    data.organization_name || '',
    data.industry || '',
    data.country || '',
    data.website || '',
    data.employees || '',
    (data.service_areas || []).join(', '),
    data.key_challenge || '',
    data.desired_outcome || '',
    data.reform_context || '',
    data.start_date || '',
    data.timeline || '',
    data.budget_approved || '',
    data.contact_name || '',
    data.contact_email || '',
    data.contact_phone || '',
    data.contact_role || '',
    data.approvers || '',
    data.partners || ''
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export default function GoogleSheetsSettings() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadSetting() {
      const { data } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'google_sheets_webhook')
        .maybeSingle();

      if (data?.value) {
        setWebhookUrl(data.value);
        setSavedUrl(data.value);
      }
      setLoading(false);
    }
    loadSetting();
  }, []);

  async function handleSave() {
    const trimmed = webhookUrl.trim();
    if (!trimmed) {
      setError('Please enter a webhook URL');
      return;
    }

    if (!trimmed.startsWith('https://script.google.com/')) {
      setError('URL must be a Google Apps Script web app URL (starts with https://script.google.com/)');
      return;
    }

    setSaving(true);
    setError('');
    setSaveSuccess(false);

    const { error: upsertError } = await supabase
      .from('app_settings')
      .upsert(
        { key: 'google_sheets_webhook', value: trimmed, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );

    setSaving(false);

    if (upsertError) {
      setError('Failed to save. Please try again.');
      return;
    }

    setSavedUrl(trimmed);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  function handleCopy() {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const isConnected = savedUrl.length > 0;
  const hasChanges = webhookUrl.trim() !== savedUrl;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-navy-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-navy-900">Google Sheets Integration</h3>
          <p className="text-sm text-navy-500">
            Automatically send consultation submissions to a Google Sheet.
          </p>
        </div>
        {isConnected && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Connected
          </span>
        )}
      </div>

      <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-5 space-y-4">
        <div>
          <p className="text-sm font-semibold text-navy-800 mb-2">Setup Instructions</p>
          <ol className="text-sm text-navy-600 space-y-2.5 list-decimal list-inside">
            <li>
              Open your Google Sheet and go to{' '}
              <span className="font-medium text-navy-800">Extensions &gt; Apps Script</span>
            </li>
            <li>Delete any existing code and paste the script below</li>
            <li>
              Click <span className="font-medium text-navy-800">Deploy &gt; New deployment</span>
            </li>
            <li>
              Select type: <span className="font-medium text-navy-800">Web app</span>
            </li>
            <li>
              Set "Who has access" to{' '}
              <span className="font-medium text-navy-800">Anyone</span>, then deploy
            </li>
            <li>Copy the <span className="font-medium text-navy-800">Web app URL</span> and paste it below</li>
          </ol>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
              Apps Script Code
            </p>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs font-medium text-navy-500 hover:text-navy-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </>
              )}
            </button>
          </div>
          <pre className="bg-navy-900 text-navy-200 text-xs leading-relaxed rounded-lg p-4 overflow-x-auto max-h-48 scrollbar-thin">
            <code>{APPS_SCRIPT_CODE}</code>
          </pre>
        </div>

        <a
          href="https://docs.google.com/spreadsheets/create"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Create a new Google Sheet
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-700 mb-1.5">
          Google Apps Script Web App URL
        </label>
        <div className="flex gap-3">
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => {
              setWebhookUrl(e.target.value);
              setError('');
              setSaveSuccess(false);
            }}
            placeholder="https://script.google.com/macros/s/.../exec"
            className={`flex-1 px-4 py-3 bg-white border rounded-lg text-navy-900 placeholder:text-navy-300 transition-colors text-sm ${
              error
                ? 'border-error-400 ring-1 ring-error-200'
                : 'border-navy-200 hover:border-navy-300 focus:border-navy-600 focus:ring-1 focus:ring-navy-200'
            }`}
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-navy-800 rounded-lg hover:bg-navy-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
        {error && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-error-500">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {error}
          </p>
        )}
        {saveSuccess && (
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Webhook URL saved successfully. New submissions will be sent to your Google Sheet.
          </p>
        )}
      </div>
    </div>
  );
}
