import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useForm, Controller } from "react-hook-form";
import { fetchAllSports as fetchAllSportsThunk } from "../../store/slices/sportSlice";
import axios from "axios";
import { Dumbbell, Edit2, Trash2, Plus, X, Users } from "lucide-react";
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
  const [addRoleInput, setAddRoleInput] = useState("");
  const [addRoles, setAddRoles] = useState(["Player"]);
  const [editRoleInput, setEditRoleInput] = useState("");
  const [editRoles, setEditRoles] = useState([]);

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    formState: { errors: errorsAdd, isValid: isValidAdd },
    reset: resetAdd,
    control: controlAdd,
    watch: watchAdd,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      teamBased: "false",
      playersPerTeam: "",
    },
  });

  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    formState: { errors: errorsEdit, isValid: isValidEdit },
    reset: resetEdit,
    control: controlEdit,
    watch: watchEdit,
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
      playersPerTeam: sport.playersPerTeam || "",
    });
    setEditRoles(sport.roles || ["Player"]);
    setShowEditModal(true);
  };

  const onSubmitAdd = async (data) => {
    setIsSubmitting(true);
    try {
      const isTeamBased = data.teamBased === "true";
      await axios.post(
        `${API_BASE_URL}/sports`,
        {
          name: data.name,
          teamBased: isTeamBased,
          roles: addRoles.length > 0 ? addRoles : ["Player"],
          playersPerTeam: isTeamBased && data.playersPerTeam ? Number(data.playersPerTeam) : null,
        },
        { withCredentials: true }
      );
      toast.success("Sport created successfully");
      resetAdd();
      setAddRoles(["Player"]);
      setAddRoleInput("");
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
      const isTeamBased = data.teamBased === "true";
      await axios.put(
        `${API_BASE_URL}/sports/${editingSport._id}`,
        {
          name: data.name,
          teamBased: isTeamBased,
          roles: editRoles.length > 0 ? editRoles : ["Player"],
          playersPerTeam: isTeamBased && data.playersPerTeam ? Number(data.playersPerTeam) : null,
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
      width: "20%",
      render: (sport) => (
        <p className="font-semibold text-text-primary dark:text-text-primary-dark">
          {sport.name}
        </p>
      ),
    },
    {
      header: "Type",
      width: "15%",
      render: (sport) => (
        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
          sport.teamBased
            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
        }`}>
          {sport.teamBased ? "Team" : "Individual"}
        </span>
      ),
    },
    {
      header: "Roles",
      width: "25%",
      render: (sport) => (
        <div className="flex flex-wrap gap-1">
          {(sport.roles || ["Player"]).map((role) => (
            <span key={role} className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {role}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: "Players/Team",
      width: "15%",
      render: (sport) => (
        <span className="text-text-primary dark:text-text-primary-dark">
          {sport.teamBased ? (sport.playersPerTeam || "—") : "N/A"}
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
            size="sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </Button>
          <Button
            onClick={(e) => handleDelete(e, sport._id)}
            disabled={deletingId === sport._id}
            loading={deletingId === sport._id}
            variant="danger"
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm font-semibold">Delete</span>
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
    <div className="space-y-6">
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
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Dumbbell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-2">
            No Sports Found
          </h3>
          <p className="text-base dark:text-base-dark">
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
                placeholder="e.g. Cricket, Football, Chess"
                {...registerAdd("name", {
                  required: "Sport name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                  maxLength: { value: 20, message: "Name must be under 20 characters" },
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

              {watchAdd("teamBased") === "true" && (
                <Input
                  label="Players Per Team"
                  type="number"
                  placeholder="e.g. 11"
                  {...registerAdd("playersPerTeam", {
                    min: { value: 1, message: "Must be at least 1" },
                    max: { value: 50, message: "Must be 50 or less" },
                  })}
                  error={errorsAdd.playersPerTeam?.message}
                />
              )}

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                  Roles
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={addRoleInput}
                    onChange={(e) => setAddRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const role = addRoleInput.trim();
                        if (role && !addRoles.includes(role)) {
                          setAddRoles([...addRoles, role]);
                          setAddRoleInput("");
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Type a role and press Enter"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const role = addRoleInput.trim();
                      if (role && !addRoles.includes(role)) {
                        setAddRoles([...addRoles, role]);
                        setAddRoleInput("");
                      }
                    }}
                    className="px-3 py-2 bg-secondary text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {addRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => setAddRoles(addRoles.filter((r) => r !== role))}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {addRoles.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">At least one role is recommended</p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  variant="secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!isValidAdd || isSubmitting} loading={isSubmitting}>
                  Add Sport
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
                placeholder="e.g. Cricket, Football, Chess"
                {...registerEdit("name", {
                  required: "Sport name is required",
                  minLength: { value: 2, message: "Name must be at least 2 characters" },
                  maxLength: { value: 20, message: "Name must be under 20 characters" },
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
                    name="teamBasedEdit"
                    value={value}
                    onChange={onChange}
                    error={errorsEdit.teamBased?.message}
                    required
                  />
                )}
              />

              {watchEdit("teamBased") === "true" && (
                <Input
                  label="Players Per Team"
                  type="number"
                  placeholder="e.g. 11"
                  {...registerEdit("playersPerTeam", {
                    min: { value: 1, message: "Must be at least 1" },
                    max: { value: 50, message: "Must be 50 or less" },
                  })}
                  error={errorsEdit.playersPerTeam?.message}
                />
              )}

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-2">
                  Roles
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={editRoleInput}
                    onChange={(e) => setEditRoleInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const role = editRoleInput.trim();
                        if (role && !editRoles.includes(role)) {
                          setEditRoles([...editRoles, role]);
                          setEditRoleInput("");
                        }
                      }
                    }}
                    className="flex-1 px-4 py-2 rounded-lg border border-base-dark dark:border-base bg-card-background dark:bg-card-background-dark text-text-primary dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    placeholder="Type a role and press Enter"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const role = editRoleInput.trim();
                      if (role && !editRoles.includes(role)) {
                        setEditRoles([...editRoles, role]);
                        setEditRoleInput("");
                      }
                    }}
                    className="px-3 py-2 bg-secondary text-white rounded-lg text-sm hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editRoles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                      {role}
                      <button
                        type="button"
                        onClick={() => setEditRoles(editRoles.filter((r) => r !== role))}
                        className="hover:text-red-500 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                {editRoles.length === 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">At least one role is recommended</p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  variant="secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!isValidEdit || isSubmitting} loading={isSubmitting}>
                  Update Sport
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
