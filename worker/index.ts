export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === "odontonutri.com") {
      url.hostname = "www.odontonutri.com";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname.startsWith("/api/")) {
      return Response.json({ name: "Odontología y Nutrición" });
    }
    return new Response(null, { status: 404 });
  },
} satisfies ExportedHandler;
