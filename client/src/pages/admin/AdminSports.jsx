import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { fetchAllSports as fetchAllSportsThunk } from "../../store/slices/sportSlice";
import axios from "axios";
import { Dumbbell, Edit2, Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import BackButton from "../../components/ui/BackButton";
import Spinner from "../../components/ui/Spinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import DataTable from "../../components/ui/DataTable";
import SearchBar from "../../components/ui/SearchBar";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import RadioGroup from "../../components/ui/RadioGroup";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

const teamBasedOptions = [
  { value: "true", label: "Team-Based" },
  { value: "false", label: "Individual" },
];

const AdminSports = () => {
  const dispatch = useDispatch();
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSport, setEditingSport] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: errorsAdd, isValid: isValidAdd },
    reset: resetAdd,
    control: controlAdd,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      teamBased: "false",
      description: "",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit, isValid: isValidEdit },
    reset: resetEdit,
    control: controlEdit,
  } = useForm({
    mode: "onChange",
  });

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/sports`, {
        withCredentials: true,
      });
      setSports(response.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch sports");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, sportId) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this sport? This action cannot be undone.")) return;

    setDeletingId(sportId);
    try {
      await axios.delete(`${API_BASE_URL}/sports/${sportId}`, {
        withCredentials: true,
      });
      toast.success("Sport deleted successfully");
      fetchSports();
      dispatch(fetchAllSportsThunk());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete sport");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (e, sport) => {
    e.stopPropagation();
    setEditingSport(sport);
    resetEdit({
      name: sport.name,
      teamBased: sport.teamBased ? "true" : "false",
      description: sport.description || "",
    });
    setShowEditModal(true);
  };

  const onSubmitAdd = async (data) => {
    setIsSubmitting(true);
    try {
      await axios.post(
        `${API_BASE_URL}/sports`,
        {
          name: data.name,
          teamBased: data.teamBased === "true",
          description: data.description,
        },
        { withCredentials: true }
      );
      toast.success("Sport created successfully");
      resetAdd();
      setShowAddModal(false);
      fetchSports();
      dispatch(fetchAllSportsThunk());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create sport");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitEdit = async (data) => {
    setIsSubmitting(true);
    try {
      await axios.put(
        `${API_BASE_URL}/sports/${editingSport._id}`,
        {
          name: data.name,
          teamBased: data.teamBased === "true",
          description: data.description,
        },
        { withCredentials: true }
      );
      toast.success("Sport updated successfully");
      setShowEditModal(false);
      setEditingSport(null);
      fetchSports();
      dispatch(fetchAllSportsThunk());
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update sport");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: "Sport",
      width: "35%",
      render: (sport) => (
        <p className="font-semibold text-text-primary dark:text-text-primary-dark">
          {sport.name}
        </p>
      ),
    },
    {
      header: "Type",
      width: "35%",
      render: (sport) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
          sport.teamBased
            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        }`}>
          {sport.teamBased ? "Team-Based" : "Individual"}
        </span>
      ),
    },
    {
      header: "Actions",
      width: "30%",
      headerClassName: "text-right",
      cellClassName: "text-right",
      render: (sport) => (
        <div className="flex gap-2 justify-end">
          <Button
            onClick={(e) => handleEdit(e, sport)}
            className="!px-3 !py-2 flex items-center justify-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Edit</span>
          </Button>
          <Button
            onClick={(e) => handleDelete(e, sport._id)}
            disabled={deletingId === sport._id}
            className="!bg-red-600 hover:!bg-red-700 !text-white !px-3 !py-2 flex items-center justify-center gap-2"
          >
            {deletingId === sport._id ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Delete</span>
              </>
            )}
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <BackButton />
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            Sports Management
          </h1>
          <p className="text-base dark:text-base-dark mt-2">
            Manage all sports available on the platform
          </p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 max-w-fit"
        >
          <Plus className="w-5 h-5" />
          Add Sport
        </Button>
      </div>

      {error && (
        <ErrorMessage 
          message={error} 
          type="error" 
          onDismiss={() => setError(null)} 
        />
      )}

      {/* Search */}
      <SearchBar
        placeholder="Search sports by name..."
        searchQuery={searchTerm}
        setSearchQuery={setSearchTerm}
      />

      {sports.length === 0 ? (
        <div className="text-center py-12">
          <Dumbbell className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No Sports Found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            No sports are currently available in the system.
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={sports.filter((s) =>
            searchTerm
              ? s.name?.toLowerCase().includes(searchTerm.toLowerCase())
              : true
          )}
          itemsPerPage={10}
          emptyMessage="No sports found"
        />
      )}

      {/* Add Sport Modal */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Add New Sport
            </h2>
            <form onSubmit={handleSubmitAdd(onSubmitAdd)} className="space-y-6">
              <Input
                label="Sport Name"
                type="text"
                placeholder="Enter sport name"
                {...registerAdd("name", {
                  required: "Sport name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
                error={errorsAdd.name?.message}
                required
              />

              <Controller
                name="teamBased"
                control={controlAdd}
                rules={{ required: "Sport type is required" }}
                render={({ field: { value, onChange, ref } }) => (
                  <RadioGroup
                    ref={ref}
                    label="Sport Type"
                    options={teamBasedOptions}
                    name="teamBased"
                    value={value}
                    onChange={onChange}
                    error={errorsAdd.teamBased?.message}
                    required
                  />
                )}
              />

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                  Description (Optional)
                </label>
                <textarea
                  {...registerAdd("description")}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter sport description"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="!bg-gray-500 hover:!bg-gray-600"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!isValidAdd || isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" /> : "Add Sport"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Edit Sport Modal */}
      {showEditModal && editingSport && (
        <Modal onClose={() => setShowEditModal(false)}>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Edit Sport
            </h2>
            <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="space-y-6">
              <Input
                label="Sport Name"
                type="text"
                placeholder="Enter sport name"
                {...registerEdit("name", {
                  required: "Sport name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                })}
                error={errorsEdit.name?.message}
                required
              />

              <Controller
                name="teamBased"
                control={controlEdit}
                rules={{ required: "Sport type is required" }}
                render={({ field: { value, onChange, ref } }) => (
                  <RadioGroup
                    ref={ref}
                    label="Sport Type"
                    options={teamBasedOptions}
                    name="teamBased"
                    value={value}
                    onChange={onChange}
                    error={errorsEdit.teamBased?.message}
                    required
                  />
                )}
              />

              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                  Description (Optional)
                </label>
                <textarea
                  {...registerEdit("description")}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter sport description"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="!bg-gray-500 hover:!bg-gray-600"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!isValidEdit || isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" /> : "Update Sport"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AdminSports;
