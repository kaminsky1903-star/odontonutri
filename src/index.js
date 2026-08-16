export default {
  async fetch(request) {
    if (new URL(request.url).pathname.startsWith("/api/")) {
      return Response.json({ name: "Odontonutri" });
    }
    return new Response(null, { status: 404 });
  },
};
