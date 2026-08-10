const base = 'https://bazookashoecare.com';

async function main() {
  const html = await (await fetch(base + '/')).text();
  const themes = [
    ...html.matchAll(/wp-content\/themes\/([^/"']+)/g),
  ].map((m) => m[1]);
  const plugins = [
    ...html.matchAll(/wp-content\/plugins\/([^/"']+)/g),
  ].map((m) => m[1]);
  const generators = [
    ...html.matchAll(/<meta name="generator" content="([^"]+)"/gi),
  ].map((m) => m[1]);

  console.log(
    JSON.stringify(
      {
        themes: [...new Set(themes)],
        plugins: [...new Set(plugins)].sort(),
        generators: [...new Set(generators)],
      },
      null,
      2,
    ),
  );

  const checks = [
    '/wp-content/plugins/parcelpanel/',
    '/wp-content/plugins/omise/',
    '/wp-content/plugins/woocommerce/',
    '/wp-content/plugins/woo-gutenberg-products-block/',
    '/wp-json/parcelpanel/v1',
    '/wp-json/omise',
  ];
  for (const path of checks) {
    const res = await fetch(base + path, { redirect: 'manual' });
    console.log(
      JSON.stringify({
        path,
        status: res.status,
        location: res.headers.get('location'),
      }),
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
