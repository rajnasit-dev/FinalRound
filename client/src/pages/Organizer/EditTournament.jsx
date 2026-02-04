import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Calendar, Trophy, DollarSign, X, Save, MapPin, Plus, Trash2, FileText } from "lucide-react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import RadioGroup from "../../components/ui/RadioGroup";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import BackButton from "../../components/ui/BackButton";
import { fetchTournamentById, updateTournament } from "../../store/slices/tournamentSlice";
import { fetchAllSports } from "../../store/slices/sportSlice";

// Validation functions
const validateFutureDate = (date) => {
  if (!date) return true;
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return "Date must be in the future";
  }
  return true;
};

const validateEndDate = (endDate, startDate) => {
  if (!endDate || !startDate) return true;
  if (new Date(endDate) <= new Date(startDate)) {
    return "End date must be after start date";
  }
  return true;
};

const validateRegistrationEndDate = (regEndDate, regStartDate, tournamentStartDate) => {
  if (!regEndDate) return true;
  if (regStartDate && new Date(regEndDate) <= new Date(regStartDate)) {
    return "Registration end date must be after registration start date";
  }
  if (tournamentStartDate && new Date(regEndDate) > new Date(tournamentStartDate)) {
    return "Registration must end on or before tournament start date";
  }
  return true;
};

const validateTournamentStartDate = (startDate, regEndDate) => {
  if (!startDate) return true;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const selectedDate = new Date(startDate);
  if (selectedDate < today) {
    return "Tournament start date must be in the future";
  }
  if (regEndDate && new Date(startDate) < new Date(regEndDate)) {
    return "Tournament must start on or after registration end date";
  }
  return true;
};

const EditTournament = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { sports } = useSelector((state) => state.sport);
  const { selectedTournament, loading } = useSelector((state) => state.tournament);
  const [rules, setRules] = useState([""]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      registrationType: "Team",
      format: "League",
    },
  });

  const registrationType = watch("registrationType", "Team");

  useEffect(() => {
    dispatch(fetchAllSports());
    dispatch(fetchTournamentById(tournamentId));
  }, [dispatch, tournamentId]);

  useEffect(() => {
    if (!selectedTournament) return;

    const formatDate = (date) => {
      if (!date) return "";
      return new Date(date).toISOString().split("T")[0];
    };

    reset({
      name: selectedTournament.name || "",
      sport: selectedTournament.sport?._id || "",
      format: selectedTournament.format || "League",
      registrationType: selectedTournament.registrationType || "Team",
      description: selectedTournament.description || "",
      teamLimit: selectedTournament.teamLimit || "",
      playersPerTeam: selectedTournament.playersPerTeam || "",
      registrationStart: formatDate(selectedTournament.registrationStart),
      registrationEnd: formatDate(selectedTournament.registrationEnd),
      startDate: formatDate(selectedTournament.startDate),
      endDate: formatDate(selectedTournament.endDate),
      entryFee: selectedTournament.entryFee || 0,
      prizePool: selectedTournament.prizePool || "",
      groundName: selectedTournament.ground?.name || "",
      groundCity: selectedTournament.ground?.city || "",
      groundAddress: selectedTournament.ground?.address || "",
    });

    setRules(
      selectedTournament.rules && selectedTournament.rules.length > 0
        ? selectedTournament.rules
        : [""]
    );
  }, [selectedTournament, reset]);

  const sportOptions = [
    { value: "", label: "Select Sport" },
    ...(sports?.map((sport) => ({ value: sport._id, label: sport.name })) || []),
  ];

  const formatOptions = [
    { value: "League", label: "League" },
    { value: "Knockout", label: "Knockout" },
    { value: "Round Robin", label: "Round Robin" },
  ];

  const registrationTypeOptions = [
    { value: "Team", label: "Team Based" },
    { value: "Player", label: "Individual Player" },
  ];

  const onSubmit = async (data) => {
    try {
      const updateData = {
        name: data.name,
        sport: data.sport,
        format: data.format,
        registrationType: data.registrationType,
        description: data.description || "",
        teamLimit: data.teamLimit,
        playersPerTeam: data.playersPerTeam || undefined,
        registrationStart: data.registrationStart,
        registrationEnd: data.registrationEnd,
        startDate: data.startDate,
        endDate: data.endDate,
        entryFee: data.entryFee || 0,
        prizePool: data.prizePool || "",
        ground: {
          name: data.groundName || "",
          city: data.groundCity || "",
          address: data.groundAddress || "",
        },
        rules: rules.filter((rule) => rule.trim() !== ""),
      };

      const result = await dispatch(updateTournament({ id: tournamentId, data: updateData })).unwrap();

      if (result) {
        navigate(`/organizer/tournaments/${tournamentId}`);
      }
    } catch (error) {
      console.error("Failed to update tournament:", error);
    }
  };

  const addRule = () => setRules([...rules, ""]);
  const removeRule = (index) => setRules(rules.filter((_, i) => i !== index));
  const updateRule = (index, value) => {
    const next = [...rules];
    next[index] = value;
    setRules(next);
  };

  if (loading && !selectedTournament) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/organizer/tournaments/${tournamentId}`)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">Edit Tournament</h1>
          <p className="text-base dark:text-base-dark">Update tournament details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Tournament Name"
              placeholder="Enter tournament name"
              error={errors.name?.message}
              {...register("name", {
                required: "Tournament name is required",
                minLength: {
                  value: 3,
                  message: "Tournament name must be at least 3 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Tournament name must not exceed 100 characters",
                },
              })}
            />

            <Select
              label="Sport"
              options={sportOptions}
              error={errors.sport?.message}
              {...register("sport", {
                required: "Please select a sport",
              })}
            />

            <Select
              label="Format"
              options={formatOptions}
              error={errors.format?.message}
              {...register("format", { required: "Format is required" })}
            />

            <Controller
              name="registrationType"
              control={control}
              rules={{ required: "Registration type is required" }}
              render={({ field }) => (
                <RadioGroup
                  label="Registration Type"
                  options={registrationTypeOptions}
                  {...field}
                  error={errors.registrationType?.message}
                />
              )}
            />

            <Input
              label={registrationType === "Team" ? "Team Limit" : "Player Limit"}
              type="number"
              placeholder="Enter limit"
              error={errors.teamLimit?.message}
              {...register("teamLimit", {
                required: "Limit is required",
                min: {
                  value: 2,
                  message: "Minimum teams must be at least 2",
                },
                max: {
                  value: 1000,
                  message: "Maximum teams cannot exceed 1000",
                },
              })}
            />

            {registrationType === "Team" && (
              <Input
                label="Players Per Team"
                type="number"
                placeholder="Enter players per team"
                error={errors.playersPerTeam?.message}
                {...register("playersPerTeam", { min: { value: 1, message: "Minimum 1 player required" } })}
              />
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                placeholder="Enter tournament description"
                {...register("description", {
                  maxLength: {
                    value: 500,
                    message: "Description must not exceed 500 characters",
                  },
                })}
                className="w-full py-3 px-4 bg-card-background dark:bg-card-background-dark rounded-lg border border-base-dark dark:border-base dark:focus:border-base-dark/50 focus:border-base/50 focus:outline-none text-base dark:text-base-dark min-h-[100px]"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Important Dates
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Registration Start"
              type="date"
              error={errors.registrationStart?.message}
              {...register("registrationStart", { required: "Registration start date is required" })}
            />

            <Input
              label="Registration End"
              type="date"
              error={errors.registrationEnd?.message}
              {...register("registrationEnd", {
                required: "Registration end date is required",
                validate: (value) => validateRegistrationEndDate(value, watch("registrationStart"), watch("startDate"))
              })}
            />

            <Input
              label="Tournament Start Date"
              type="date"
              error={errors.startDate?.message}
              {...register("startDate", {
                required: "Date is required",
                validate: (value) => validateTournamentStartDate(value, watch("registrationEnd"))
              })}
            />

            <Input
              label="Tournament End Date"
              type="date"
              error={errors.endDate?.message}
              {...register("endDate", {
                required: "Date is required",
                validate: (value) => validateEndDate(value, watch("startDate"))
              })}
            />
          </div>
        </div>

        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-secondary" />
            Financial Details
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Entry Fee"
              type="number"
              placeholder="0"
              icon={<DollarSign className="w-5 h-5" />}
              error={errors.entryFee?.message}
              {...register("entryFee", {
                min: {
                  value: 0,
                  message: "Entry fee cannot be negative",
                },
                max: {
                  value: 1000000,
                  message: "Entry fee is too high",
                },
              })}
            />

            <Input
              label="Prize Pool"
              placeholder="e.g., $10,000 or Trophies"
              error={errors.prizePool?.message}
              {...register("prizePool", {
                min: {
                  value: 0,
                  message: "Prize pool cannot be negative",
                },
              })}
            />
          </div>
        </div>

        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            Venue Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Ground Name"
              placeholder="Enter ground name"
              {...register("groundName", {
                minLength: {
                  value: 3,
                  message: "Ground name must be at least 3 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Ground name must not exceed 100 characters",
                },
              })}
              error={errors.groundName?.message}
            />
            <Input
              label="City"
              placeholder="Enter city"
              {...register("groundCity", {
                minLength: { value: 2, message: "City must be at least 2 characters" },
                maxLength: { value: 50, message: "City must be under 50 characters" },
              })}
              error={errors.groundCity?.message}
            />
            <div className="md:col-span-2">
              <Input
                label="Address"
                placeholder="Enter full address"
                {...register("groundAddress", {
                  minLength: {
                    value: 10,
                    message: "Address must be at least 10 characters",
                  },
                  maxLength: {
                    value: 200,
                    message: "Address must not exceed 200 characters",
                  },
                })}
                error={errors.groundAddress?.message}
              />
            </div>
          </div>
        </div>

        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark flex items-center gap-2">
              <FileText className="w-5 h-5 text-secondary" />
              Tournament Rules
            </h2>
            <button
              type="button"
              onClick={addRule}
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-all duration-200 hover:shadow-lg font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>

          {rules.length === 0 ? (
            <div className="text-center py-8 px-4 border-2 border-dashed border-base-dark dark:border-base rounded-xl">
              <FileText className="w-12 h-12 mx-auto mb-3 text-base dark:text-base-dark opacity-50" />
              <p className="text-base dark:text-base-dark mb-4">No rules added yet</p>
              <button
                type="button"
                onClick={addRule}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-white rounded-lg transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add First Rule
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule, index) => (
                <div
                  key={index}
                  className="group relative bg-primary dark:bg-primary-dark rounded-lg border border-base-dark dark:border-base p-4 transition-all duration-200 hover:shadow-md hover:border-secondary dark:hover:border-secondary"
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-secondary/10 dark:bg-secondary/20 rounded-lg flex items-center justify-center text-secondary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder={`Enter rule ${index + 1}...`}
                        value={rule}
                        onChange={(e) => updateRule(index, e.target.value)}
                        className="w-full bg-transparent border-0 outline-none text-text-primary dark:text-text-primary-dark placeholder-base dark:placeholder-base-dark focus:ring-0 px-0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeRule(index)}
                      className="flex-shrink-0 p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      title="Remove rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {rules.length > 0 && (
            <div className="mt-4 flex items-center justify-between text-sm text-base dark:text-base-dark">
              <span>{rules.length} rule{rules.length !== 1 ? 's' : ''} added</span>
              {rules.some(r => !r.trim()) && (
                <span className="text-amber-600 dark:text-amber-400">
                  ⚠ Some rules are empty
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            onClick={() => navigate(`/organizer/tournaments/${tournamentId}`)}
            className="bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600 px-6 py-3 flex items-center justify-center gap-2"
          >
            <X size={18} />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-secondary dark:bg-secondary-dark hover:opacity-90 px-6 py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Spinner size="sm" />
            ) : (
              <>
                <Save size={18} />
                Update Tournament
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTournament;
