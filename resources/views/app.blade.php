<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ config('app.name') }}</title>
    <link rel="icon" href="{{ asset('favicon.ico') }}" sizes="any" type="image/x-icon" />
    <link rel="icon" href="{{ asset('vite.svg') }}" type="image/svg+xml" />
    <link rel="manifest" href="{{ asset('manifest.webmanifest') }}" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=Poppins:wght@300;400;500;600;700&display=swap"
      rel="stylesheet"
    />
    @viteReactRefresh
    @vite('resources/js/main.jsx')
  </head>
  <body class="antialiased bg-cream text-ebony">
    <div id="root"></div>
  </body>
</html>
