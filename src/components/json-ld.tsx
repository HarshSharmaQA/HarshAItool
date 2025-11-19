
type JsonLdProps = {
    type: string;
    data: { [key: string]: any };
};

export default function JsonLd({ type, data }: JsonLdProps) {
    const jsonLdData = {
        '@context': 'https://schema.org',
        '@type': type,
        ...data,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
        />
    );
}
