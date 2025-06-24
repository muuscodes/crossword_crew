export default function Contact() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center m-auto">
      <h1 className="text-center text-7xl mb-10 mt-5">Contact</h1>
      <form
        action="POST"
        className="flex flex-col border-4 shadow-2xl h-100 w-2/3"
      >
        <label htmlFor="username" className="m-1 text-2xl">
          Username
        </label>
        <input
          type="text"
          name="username"
          id="username"
          className="border-1 m-2 text-2xl"
        />
        <label htmlFor="email" className="m-1 text-2xl">
          Email
        </label>
        <input
          type="email"
          name="email"
          id="email"
          className="border-1 m-2 text-2xl"
        />
        <label htmlFor="message" className="m-1 text-2xl">
          Message
        </label>
        <textarea
          name="message"
          id="message"
          className="border-1 h-full m-2 text-2xl"
        ></textarea>
        <button className="fancyButton bigger m-2">Submit</button>
      </form>
    </div>
  );
}
