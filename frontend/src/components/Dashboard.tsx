import axios from "axios";
import { ChevronLeft, ChevronRight, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";

type User = {
  id?: string;
  name: string;
  dateCreated: string | Date;
  role: string;
  status: "active" | "suspended" | "inactive";
};

const Dashboard = () => {
  const [users, setUsers] = useState([]);

  const windowSize = 5;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    } else {
      axios
        .get("http://localhost:3000/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          console.log("Dashboard response: ", res.data);
          setUsers(res.data);
          setTotalPages(Math.ceil(res.data.length / windowSize));
        })
        .catch((err) => console.error("Dashboard error: ", err));
    }
  }, []);

  return (
    <div className="m-10 w-full flex-1/2 bg-gray-100 overflow-x-auto p-4">
      <table className="min-w-full table-auto border-collapse rounded-lg shadow-md">
        <thead>
          <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700">
            <th className="p-4">#</th>
            <th className="p-4">Name</th>
            <th className="p-4">Date Created</th>
            <th className="p-4">Role</th>
            <th className="p-4">Status</th>
            <th className="p-4">Action</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700">
          {users
            .slice((page - 1) * windowSize, page * windowSize)
            .map((user: User, index: number) => (
              <tr key={user.id || index} className="border-b hover:bg-gray-50">
                <td className="p-4">{(page - 1) * windowSize + index + 1}</td>
                <td className="p-4 flex items-center gap-3">
                  <span className="font-medium text-gray-700">{user.name}</span>
                </td>
                <td className="p-4">
                  {new Date(user.dateCreated).toLocaleDateString("en-GB")}
                </td>
                <td className="p-4">{user.role}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center gap-2 text-sm font-medium ${
                      user.status === "active"
                        ? "text-green-600"
                        : user.status === "inactive"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-current"></span>
                    {user.status}
                  </span>
                </td>
                <td className="p-4 flex gap-2">
                  <Settings className="text-blue-500 hover:text-blue-700" />
                  <X className="text-red-500 hover:text-red-700" />
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {/* pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="mr-2" />
        </button>
        <div className="text-sm text-gray-700">
          Page {page} of {totalPages}
        </div>
        <button
          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
        >
          <ChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
