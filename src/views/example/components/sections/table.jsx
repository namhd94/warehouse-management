// This component does not require a <label>, placeholder, or aria-label since it is a mock table, not a form.
import { useState, useMemo } from "react";
import { AlignJustify, Eye, Edit, Trash, Plus } from "lucide-react";
import Card from "@/components/card";
import Table from "@/components/table";
import Pagination from "@/components/pagination";
import Button from "@/components/button";
import Avatar from "@/components/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/components/dropdown-menu";
import { BUTTON_TYPE, ALIGN } from "@/helpers/constants";

const SectionTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Pagination Logic
  const totalPages = Math.ceil(MOCK_DATA.length / itemsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return MOCK_DATA.slice(start, start + itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const columns = [
    {
      label: "Institution Name",
      className: "min-w-[300px]",
      render: (row) => (
        <Avatar color={row.color} fallback="A" name={row.name} />
      ),
    },
    {
      label: "Institution Code",
      id: "code",
    },
    {
      label: "Transaction",
      id: "transaction",
    },
    {
      label: "Institution Type",
      id: "type",
      render: (row) => <span className="text-gray-600">{row.type}</span>,
    },
    {
      label: "LPO",
      id: "lpo",
      render: (row) => <span className="text-gray-600">{row.lpo}</span>,
    },
    {
      label: "Current Status",
      id: "status",
      render: (row) => <span className="text-gray-600">{row.status}</span>,
    },
    {
      label: "",
      id: "actions",
      align: ALIGN.RIGHT,
      render: (row) => (
        <Dropdown>
          <DropdownTrigger asChild>
            <Button
              variant={BUTTON_TYPE.LINK}
              className="text-gray-500 hover:text-gray-700"
            >
              <AlignJustify className="w-4 h-4" />
            </Button>
          </DropdownTrigger>
          <DropdownContent className="w-40">
            <DropdownItem onClick={() => console.log("View", row)}>
              <Eye className="mr-2 h-4 w-4" />
              <span>View</span>
            </DropdownItem>
            <DropdownItem onClick={() => console.log("Edit", row)}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Edit</span>
            </DropdownItem>
            <DropdownItem
              onClick={() => console.log("Delete", row)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 hover:bg-red-50"
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="space-y-6 bg-gray-50">
      {/* Table Section */}
      <div className="flex flex-col gap-3">
        <Table
          columns={columns}
          data={paginatedData}
          onRowClick={(row) => console.log("row click", row)}
          title="Result"
          action={
            <Button variant={BUTTON_TYPE.OUTLINE} icon={Plus}>
              Add
            </Button>
          }
        />
        <Pagination
          totalPage={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default SectionTable;

// Mock Data Generator
const generateMockData = (count = 50) => {
  const institutionTypes = ["DepEd PSU", "LPO", "LGU"];
  const statuses = [
    "Approved CAM/Approved",
    "FDE/Draft",
    "FDE/Returned to FDE",
    "Accreditation",
  ];
  const transactions = [
    "Increase in Credit Limit",
    "Accreditation",
    "Migration",
    "Maintenance",
  ];
  const lpos = [
    "809 LPO Tarlac",
    "LPO Naga",
    "803 LPO Makati",
    "806 LPO Gensan",
  ];

  const colors = [
    "bg-blue-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-red-500",
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Institution Name ${i + 1} - ${
      ["School", "Treasury Dept", "Planning & Dev", "Social Welfare"][i % 4]
    }`,
    code: `CODE-${1000 + i}`,
    transaction: transactions[i % transactions.length],
    type: institutionTypes[i % institutionTypes.length],
    lpo: lpos[i % lpos.length],
    status: statuses[i % statuses.length],
    color: colors[i % colors.length],
  }));
};

const MOCK_DATA = generateMockData(100);
