export default function NoPage() {
  return (
    <div className="min-h-screen justify-center text-center">
      <h1 className="md:text-6xl text-2xl mt-50 mx-auto">Page not found!</h1>
      <a
        href={"/"}
        target="_self"
        id={"home"}
        key={"home"}
        aria-label={"home" + " page"}
      >
        <h2 className="md:text-4xl text-xl underline mt-10">Homepage</h2>
      </a>
    </div>
  );
}
