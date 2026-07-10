import Buttons from "./buttons";

export default function Header() {
  const navList = ["Research", "Insights", "Reports"];
  return (
    <header className="mt-1 mx-40 p-2 flex items-center justify-between  ">
      <h1 className="font-semibold text-xl">Marketinguili</h1>

      <nav>
        <ul className="flex items-center gap-4 justify-center">
          {navList.map((option, index) => {
            return (
              <li key={index}>
                {" "}
                <a href="#"> {option}</a>{" "}
              </li>
            );
          })}
        </ul>
      </nav>

      <Buttons buttonName={"Sign Up"} />
    </header>
  );
}
