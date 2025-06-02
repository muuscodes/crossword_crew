export default function Authentication(props: any) {
  const { handleCloseModal } = props;
  return (
    <>
      <h2 className="text-4xl text-left underline">Sign in</h2>
      <p className="text-2xl">username</p>
      <input type="text" className="bg-amber-50 w-2/3 text-black" />
      <p className="text-2xl">password</p>
      <input type="password" className="bg-amber-50 w-2/3 text-black" />
      <button className="bg-amber-50 text-xl p-2 rounded-sm text-gray-600 hover:bg-gray-400 mt-10">
        Enter
      </button>
    </>
  );
}
