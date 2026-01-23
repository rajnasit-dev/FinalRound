import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { ArrowLeft, Calendar, Trophy, DollarSign, MapPin } from "lucide-react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import RadioGroup from "../../components/ui/RadioGroup";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { fetchTournamentById, updateTournament } from "../../store/slices/tournamentSlice";
import { fetchAllSports } from "../../store/slices/sportSlice";

const EditTournament = () => {
  const { tournamentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  const registrationType = watch("registrationType");

  useEffect(() => {
    dispatch(fetchAllSports());
    dispatch(fetchTournamentById(tournamentId));
  }, [dispatch, tournamentId]);

  useEffect(() => {
    if (selectedTournament) {
      // Format dates for input fields
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
    }
  }, [selectedTournament, reset]);

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

      const result = await dispatch(
        updateTournament({ id: tournamentId, data: updateData })
      ).unwrap();

      if (result) {
        navigate(`/organizer/tournaments/${tournamentId}`);
      }
    } catch (error) {
      console.error("Failed to update tournament:", error);
    }
  };

  const addRule = () => {
    setRules([...rules, ""]);
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const updateRule = (index, value) => {
    const newRules = [...rules];
    newRules[index] = value;
    setRules(newRules);
  };

  const sportOptions = [
    { value: "", label: "Select Sport" },
    ...(sports?.map((sport) => ({
      value: sport._id,
      label: sport.name,
    })) || []),
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

  if (loading && !selectedTournament) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" text="Loading tournament..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/organizer/tournaments/${tournamentId}`)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            Edit Tournament
          </h1>
          <p className="text-base dark:text-base-dark">
            Update tournament details
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-secondary" />
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Tournament Name"
              placeholder="Enter tournament name"
              {...register("name", { required: "Tournament name is required" })}
              error={errors.name?.message}
              required
            />

            <Select
              label="Sport"
              options={sportOptions}
              {...register("sport", { required: "Sport is required" })}
              error={errors.sport?.message}
              required
            />

            <Select
              label="Format"
              options={formatOptions}
              {...register("format", { required: "Format is required" })}
              error={errors.format?.message}
              required
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
                  required
                />
              )}
            />

            <Input
              label={registrationType === "Team" ? "Team Limit" : "Player Limit"}
              type="number"
              placeholder="Enter limit"
              {...register("teamLimit", {
                required: "Limit is required",
                min: { value: 2, message: "Minimum 2 required" },
              })}
              error={errors.teamLimit?.message}
              required
            />

            {registrationType === "Team" && (
              <Input
                label="Players Per Team"
                type="number"
                placeholder="Enter players per team"
                {...register("playersPerTeam", {
                  min: { value: 1, message: "Minimum 1 player required" },
                })}
                error={errors.playersPerTeam?.message}
              />
            )}

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Description
              </label>
              <textarea
                placeholder="Enter tournament description"
                {...register("description")}
                className="w-full py-3 px-4 bg-card-background dark:bg-card-background-dark rounded-lg border border-base-dark dark:border-base dark:focus:border-base-dark/50 focus:border-base/50 focus:outline-none text-base dark:text-base-dark min-h-[100px]"
              />
            </div>
          </div>
        </div>

        {/* Dates Card */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Important Dates
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Registration Start"
              type="date"
              {...register("registrationStart", {
                required: "Registration start date is required",
              })}
              error={errors.registrationStart?.message}
              required
            />

            <Input
              label="Registration End"
              type="date"
              {...register("registrationEnd", {
                required: "Registration end date is required",
              })}
              error={errors.registrationEnd?.message}
              required
            />

            <Input
              label="Tournament Start Date"
              type="date"
              {...register("startDate", {
                required: "Start date is required",
              })}
              error={errors.startDate?.message}
              required
            />

            <Input
              label="Tournament End Date"
              type="date"
              {...register("endDate", {
                required: "End date is required",
              })}
              error={errors.endDate?.message}
              required
            />
          </div>
        </div>

        {/* Financial Details Card */}
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
              {...register("entryFee", {
                min: { value: 0, message: "Entry fee cannot be negative" },
              })}
              error={errors.entryFee?.message}
            />

            <Input
              label="Prize Pool"
              placeholder="e.g., $10,000 or Trophies"
              {...register("prizePool")}
              error={errors.prizePool?.message}
            />
          </div>
        </div>

        {/* Venue Information Card */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-secondary" />
            Venue Information
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Ground Name"
              placeholder="Enter ground name"
              {...register("groundName")}
              error={errors.groundName?.message}
            />

            <Input
              label="City"
              placeholder="Enter city"
              {...register("groundCity")}
              error={errors.groundCity?.message}
            />

            <div className="md:col-span-2">
              <Input
                label="Address"
                placeholder="Enter full address"
                {...register("groundAddress")}
                error={errors.groundAddress?.message}
              />
            </div>
          </div>
        </div>

        {/* Rules Card */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Tournament Rules
          </h2>

          <div className="space-y-3">
            {rules.map((rule, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder={`Rule ${index + 1}`}
                  value={rule}
                  onChange={(e) => updateRule(index, e.target.value)}
                />
                {rules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRule(index)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={addRule}
              className="text-secondary hover:underline font-semibold"
            >
              + Add Rule
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading}
            className="bg-secondary hover:bg-secondary/90"
          >
            {loading ? "Updating..." : "Update Tournament"}
          </Button>

          <Button
            type="button"
            onClick={() => navigate(`/organizer/tournaments/${tournamentId}`)}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditTournament;
