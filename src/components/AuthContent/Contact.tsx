export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col items-center m-auto">
      <h1 className="text-center text-7xl mb-10 mt-5">Contact</h1>
      <form action="POST" className="flex flex-col border-2 h-100 w-2/3">
        <label htmlFor="username" className="m-1">
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          className="border-1 m-2"
        />
        <label htmlFor="email" className="m-1">
          Email
        </label>
        <input type="email" name="email" id="email" className="border-1 m-2" />
        <label htmlFor="message" className="m-1">
          Message
        </label>
        <input
          type="text"
          name="message"
          id="message"
          className="border-1 h-full m-2"
        />
        <button className="border-1 p-2 m-2 w-fit hover:bg-black hover:text-white">
          Submit
        </button>
      </form>
    </div>
  );
}
