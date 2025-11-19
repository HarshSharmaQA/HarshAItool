
import type { HtmlBlock } from '@/lib/types';

export default function HtmlSection(props: HtmlBlock) {
  const { html } = props;

  return (
    <div 
        className="container mx-auto px-4"
        dangerouslySetInnerHTML={{ __html: html || '' }} 
    />
  );
}
