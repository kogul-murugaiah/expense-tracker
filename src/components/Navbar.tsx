import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-gray-900 text-white px-8 py-4">
      <ul className="flex gap-8 items-center list-none m-0 p-0">
        <li>
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? 'font-semibold text-blue-400'
                : 'hover:text-blue-300'
            }
          >
            Dashboard
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/add"
            className={({ isActive }) =>
              isActive
                ? 'font-semibold text-blue-400'
                : 'hover:text-blue-300'
            }
          >
            Add Expense
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/add-income"
            className={({ isActive }) =>
              isActive
                ? 'font-semibold text-blue-400'
                : 'hover:text-blue-300'
            }
          >
            Add Income
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/expenses"
            className={({ isActive }) =>
              isActive
                ? 'font-semibold text-blue-400'
                : 'hover:text-blue-300'
            }
          >
            Manage Expenses
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/monthly"
            className={({ isActive }) =>
              isActive
                ? 'font-semibold text-blue-400'
                : 'hover:text-blue-300'
            }
          >
            Monthly
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/yearly"
            className={({ isActive }) =>
              isActive
                ? 'font-semibold text-blue-400'
                : 'hover:text-blue-300'
            }
          >
            Yearly
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
