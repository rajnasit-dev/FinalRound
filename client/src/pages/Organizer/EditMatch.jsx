import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Calendar, MapPin } from "lucide-react";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import BackButton from "../../components/ui/BackButton";
import toast from "react-hot-toast";
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
      });
    }
  }, [selectedMatch, reset]);

  const onSubmit = async (data) => {
    try {
      const updateData = {
        scheduledAt: data.scheduledAt,
        ground: {
          name: data.groundName?.trim() || "",
          city: data.groundCity?.trim() || "",
          address: data.groundAddress?.trim() || "",
        },
      };

      await dispatch(
        updateMatch({ matchId, matchData: updateData })
      ).unwrap();

      toast.success("Match updated successfully!");
      navigate(-1);
    } catch (error) {
      toast.error(error || "Failed to update match");
    }
  };

  if (loading && !selectedMatch) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark">
          Edit Match
        </h1>
        <p className="text-base dark:text-base-dark">
          Update match schedule and venue details
        </p>
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
            Schedule
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Scheduled Date & Time"
              type="datetime-local"
              {...register("scheduledAt", {
                required: "Scheduled date & time is required",
                validate: (value) => {
                  const selected = new Date(value);
                  if (isNaN(selected.getTime())) return "Invalid date";
                  return true;
                },
              })}
              error={errors.scheduledAt?.message}
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
              {...register("groundName", {
                minLength: { value: 2, message: "Ground name must be at least 2 characters" },
                maxLength: { value: 50, message: "Ground name must be under 50 characters" },
              })}
              error={errors.groundName?.message}
            />

            <Input
              label="City"
              placeholder="Enter city"
              {...register("groundCity", {
                minLength: { value: 2, message: "City must be at least 2 characters" },
                maxLength: { value: 20, message: "City must be under 20 characters" },
                pattern: {
                  value: /^[a-zA-Z\s'-]+$/,
                  message: "City can only contain letters and spaces",
                },
              })}
              error={errors.groundCity?.message}
            />

            <div className="md:col-span-2">
              <Input
                label="Address"
                placeholder="Enter full address"
                {...register("groundAddress", {
                  minLength: { value: 5, message: "Address must be at least 5 characters" },
                  maxLength: { value: 100, message: "Address must be under 100 characters" },
                })}
                error={errors.groundAddress?.message}
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
            onClick={() => navigate(-1)}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditMatch;
