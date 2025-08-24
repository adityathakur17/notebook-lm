const Navbar = () => {
  return (
    <>
      <div className="flex justify-between p-8 border border-black">
        <h1 className="font-semibold">NotebookLM</h1>
        <div className="space-x-2 font-semibold cursor-pointer">
          <button className="cursor-pointer">Login</button>
          <button className="cursor-pointer">Signup</button>
        </div>
      </div>
    </>
  );
};
export default Navbar;
