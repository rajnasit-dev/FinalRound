import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Calendar, MapPin, Award } from "lucide-react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import BackButton from "../../components/ui/BackButton";
import { fetchMatchById, updateMatch } from "../../store/slices/matchSlice";

const EditMatch = () => {
  const { matchId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { selectedMatch, loading } = useSelector((state) => state.match);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

  useEffect(() => {
    dispatch(fetchMatchById(matchId));
  }, [dispatch, matchId]);

  useEffect(() => {
    if (selectedMatch) {
      // Format datetime for input field
      const formatDateTime = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().slice(0, 16);
      };

      reset({
        scheduledAt: formatDateTime(selectedMatch.scheduledAt),
        groundName: selectedMatch.ground?.name || "",
        groundCity: selectedMatch.ground?.city || "",
        groundAddress: selectedMatch.ground?.address || "",
        status: selectedMatch.status || "Scheduled",
        scoreA: selectedMatch.scoreA || "",
        scoreB: selectedMatch.scoreB || "",
        resultText: selectedMatch.resultText || "",
      });
    }
  }, [selectedMatch, reset]);

  const onSubmit = async (data) => {
    try {
      const updateData = {
        scheduledAt: data.scheduledAt,
        ground: {
          name: data.groundName || "",
          city: data.groundCity || "",
          address: data.groundAddress || "",
        },
        status: data.status,
        scoreA: data.scoreA || "",
        scoreB: data.scoreB || "",
        resultText: data.resultText || "",
      };

      const result = await dispatch(
        updateMatch({ id: matchId, data: updateData })
      ).unwrap();

      if (result) {
        navigate("/organizer/matches");
      }
    } catch (error) {
      console.error("Failed to update match:", error);
    }
  };

  const statusOptions = [
    { value: "Scheduled", label: "Scheduled" },
    { value: "Live", label: "Live" },
    { value: "Completed", label: "Completed" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  if (loading && !selectedMatch) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/organizer/matches")}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
            Edit Match
          </h1>
          <p className="text-base dark:text-base-dark">
            Update match details, scores, and results
          </p>
        </div>
      </div>

      {/* Match Info Card */}
      {selectedMatch && (
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h3 className="text-lg font-bold text-text-primary dark:text-text-primary-dark mb-2">
            Match Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-base dark:text-base-dark">
            <div>
              <span className="font-semibold">Tournament: </span>
              {selectedMatch.tournament?.name || "N/A"}
            </div>
            <div>
              <span className="font-semibold">Sport: </span>
              {selectedMatch.sport?.name || "N/A"}
            </div>
            <div>
              <span className="font-semibold">
                {selectedMatch.teamA ? "Team A" : "Player A"}:{" "}
              </span>
              {selectedMatch.teamA?.name ||
                `${selectedMatch.playerA?.firstName || ""} ${selectedMatch.playerA?.lastName || ""}` ||
                "N/A"}
            </div>
            <div>
              <span className="font-semibold">
                {selectedMatch.teamB ? "Team B" : "Player B"}:{" "}
              </span>
              {selectedMatch.teamB?.name ||
                `${selectedMatch.playerB?.firstName || ""} ${selectedMatch.playerB?.lastName || ""}` ||
                "N/A"}
            </div>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Schedule & Status Card */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Schedule & Status
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Scheduled Date & Time"
              type="datetime-local"
              {...register("scheduledAt", {
                required: "Scheduled date & time is required",
              })}
              error={errors.scheduledAt?.message}
              required
            />

            <Select
              label="Status"
              options={statusOptions}
              {...register("status", { required: "Status is required" })}
              error={errors.status?.message}
              required
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

        {/* Score & Result Card */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-secondary" />
            Score & Result
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label={`Score ${selectedMatch?.teamA ? "Team A" : "Player A"}`}
              placeholder="e.g., 150/7 in 20 ov"
              {...register("scoreA")}
              error={errors.scoreA?.message}
            />

            <Input
              label={`Score ${selectedMatch?.teamB ? "Team B" : "Player B"}`}
              placeholder="e.g., 145/10 in 19.4 ov"
              {...register("scoreB")}
              error={errors.scoreB?.message}
            />

            <div className="md:col-span-2">
              <Input
                label="Result Text"
                placeholder="e.g., Team A won by 5 runs"
                {...register("resultText")}
                error={errors.resultText?.message}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={!isValid || loading}
            className="bg-secondary hover:bg-secondary/90"
          >
            {loading ? "Updating..." : "Update Match"}
          </Button>

          <Button
            type="button"
            onClick={() => navigate("/organizer/matches")}
            className="bg-gray-600 hover:bg-gray-700"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditMatch;
