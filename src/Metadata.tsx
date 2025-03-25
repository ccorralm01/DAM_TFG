import MetadataInterface from "./interfaces/MetadataInterface";

export default function Metadata({ title, description, url, image, icon} : MetadataInterface) {
    const domain = new URL(url).hostname;
    return (
        <>
            {/* HTML Meta Tags */}
            <title>{title}</title>
            <link rel="icon" type="image/svg+xml" href={icon} />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <meta name="description" content={description} />

            {/* Default Meta Tags */}
            <meta property="og:url" content={url} />
            <meta property="og:type" content="website" />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta property="twitter:domain" content={domain} />
            <meta property="twitter:url" content={url} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image} />
        </>
    );
}
