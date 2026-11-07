import { Alert, Button, Checkbox, Form, Input, Result, Select, Typography } from 'antd';
import type { FormRule } from 'antd';
import type { TFunction } from 'i18next';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getErrorMessage } from '../../api/errors';
import { getForm, submitForm } from '../../api/forms';
import type { FormDescription, FormFieldDescription, FormValues } from '../../api/forms';
import { PRIVACY_POLICY_PATH } from '../../utils/constants';
import { setServerFieldErrors } from '../../utils/formErrors';
import PageState from '../PageState/PageState';
import './SchemaForm.css';

const { Title } = Typography;

type Outcome = { kind: 'success'; message: string } | { kind: 'error'; message: string };

const trim = (value: unknown) => (typeof value === 'string' ? value.trim() : value);

const PATTERN_MESSAGES = {
  email: 'validation.email',
  tel: 'validation.phone',
} as const;

/** Client rules mirror the server ones, so most mistakes are caught before sending. */
function rulesFor(field: FormFieldDescription, t: TFunction<'forms'>): FormRule[] {
  if (field.type === 'checkbox' || field.type === 'consent') {
    if (!field.required) return [];
    return [
      {
        validator: (_, value) =>
          value ? Promise.resolve() : Promise.reject(new Error(t('validation.mustBeChecked'))),
      },
    ];
  }

  const rules: FormRule[] = [];
  if (field.required) {
    rules.push({
      required: true,
      whitespace: true,
      message: t('validation.required'),
    });
  }
  if (field.min_length) {
    rules.push({
      min: field.min_length,
      transform: trim,
      message: t('validation.minLength', { min: field.min_length }),
    });
  }
  if (field.max_length) {
    rules.push({
      max: field.max_length,
      transform: trim,
      message: t('validation.maxLength', { max: field.max_length }),
    });
  }
  if (field.pattern) {
    const key =
      field.type === 'email' || field.type === 'tel'
        ? PATTERN_MESSAGES[field.type]
        : 'validation.pattern';
    rules.push({
      pattern: new RegExp(field.pattern),
      transform: trim,
      message: t(key),
    });
  }
  return rules;
}

function renderControl(field: FormFieldDescription, t: TFunction<'forms'>): ReactNode {
  const maxLength = field.max_length ?? undefined;
  switch (field.type) {
    case 'textarea':
      return (
        <Input.TextArea autoSize={{ minRows: 4, maxRows: 12 }} maxLength={maxLength} showCount />
      );
    case 'email':
      return <Input inputMode="email" autoComplete="email" maxLength={maxLength} />;
    case 'tel':
      return <Input inputMode="tel" autoComplete="tel" maxLength={maxLength} />;
    case 'select':
      return <Select options={field.options} allowClear={!field.required} />;
    case 'checkbox':
      return <Checkbox>{field.label}</Checkbox>;
    case 'consent':
      return (
        <Checkbox>
          {field.label} (
          <Link to={PRIVACY_POLICY_PATH} target="_blank">
            {t('privacyPolicy')}
          </Link>
          )
        </Checkbox>
      );
    default:
      return <Input maxLength={maxLength} />;
  }
}

interface SchemaFormProps {
  /** Form name on the backend: GET/POST /forms/<name> */
  name: string;
  showTitle?: boolean;
}

/**
 * A form rendered from its backend description. Handles client validation,
 * per-field server errors and the submit states: sending, success, error with retry.
 */
const SchemaForm = ({ name, showTitle = true }: SchemaFormProps) => {
  const { t, i18n } = useTranslation('forms');
  const [form] = Form.useForm<FormValues>();
  const [description, setDescription] = useState<FormDescription | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [sending, setSending] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const lastValues = useRef<FormValues | null>(null);
  const language = i18n.language;

  // Labels come translated from the backend: reload them when the language changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `language` and `attempt` trigger a reload
  useEffect(() => {
    let active = true;
    setLoadFailed(false);
    getForm(name).then(
      (data) => active && setDescription(data),
      () => active && setLoadFailed(true),
    );
    return () => {
      active = false;
    };
  }, [name, language, attempt]);

  const send = async (values: FormValues) => {
    lastValues.current = values;
    setSending(true);
    setOutcome(null);
    try {
      const response = await submitForm(name, values);
      form.resetFields();
      setOutcome({ kind: 'success', message: response.message });
    } catch (error) {
      const names = description?.fields.map((field) => field.name) ?? [];
      if (!setServerFieldErrors(form, error, names)) {
        setOutcome({ kind: 'error', message: getErrorMessage(error) });
      }
    } finally {
      setSending(false);
    }
  };

  if (!description) {
    return loadFailed ? (
      <PageState
        kind="error"
        description={t('loadFailed')}
        action={<Button onClick={() => setAttempt((value) => value + 1)}>{t('retry')}</Button>}
      />
    ) : (
      <PageState kind="loading" />
    );
  }

  if (outcome?.kind === 'success') {
    return (
      <Result
        status="success"
        title={outcome.message}
        extra={<Button onClick={() => setOutcome(null)}>{t('sendAnother')}</Button>}
      />
    );
  }

  return (
    <div className="schema-form">
      {showTitle && <Title level={3}>{description.title}</Title>}

      {outcome?.kind === 'error' && (
        <Alert
          className="schema-form-alert"
          type="error"
          showIcon
          message={outcome.message}
          action={
            <Button
              size="small"
              loading={sending}
              onClick={() => lastValues.current && void send(lastValues.current)}
            >
              {t('retry')}
            </Button>
          }
        />
      )}

      <Form
        form={form}
        layout="vertical"
        disabled={sending}
        onFinish={send}
        scrollToFirstError
        requiredMark="optional"
      >
        {description.fields.map((field) => {
          const isCheckbox = field.type === 'checkbox' || field.type === 'consent';
          return (
            <Form.Item
              key={field.name}
              name={field.name}
              label={isCheckbox ? undefined : field.label}
              required={field.required}
              rules={rulesFor(field, t)}
              valuePropName={isCheckbox ? 'checked' : 'value'}
            >
              {renderControl(field, t)}
            </Form.Item>
          );
        })}

        {/* Off-screen, not display:none: bots skip fields that are obviously hidden */}
        <div className="schema-form-honeypot" aria-hidden="true">
          <Form.Item name={description.honeypot} label={description.honeypot}>
            <Input tabIndex={-1} autoComplete="off" />
          </Form.Item>
        </div>

        <Form.Item className="schema-form-actions">
          <Button type="primary" htmlType="submit" loading={sending}>
            {sending ? t('sending') : description.submit}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SchemaForm;
