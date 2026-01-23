import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { createMatch } from "../../store/slices/matchSlice";
import { fetchAllTournaments } from "../../store/slices/tournamentSlice";
import { fetchAllTeams } from "../../store/slices/teamSlice";

const CreateMatch = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tournaments } = useSelector((state) => state.tournament);
  const { teams } = useSelector((state) => state.team);
  const { loading } = useSelector((state) => state.match);
  
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [participants, setParticipants] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const tournamentId = watch("tournament");

  useEffect(() => {
    dispatch(fetchAllTournaments({}));
    dispatch(fetchAllTeams({}));
  }, [dispatch]);

  // Pre-select tournament from URL params
  useEffect(() => {
    const tournamentIdFromUrl = searchParams.get("tournament");
    if (tournamentIdFromUrl && tournaments) {
      setValue("tournament", tournamentIdFromUrl);
    }
  }, [searchParams, tournaments, setValue]);

  // Update selected tournament and participants when tournament changes
  useEffect(() => {
    if (tournamentId && tournaments) {
      const tournament = tournaments.find((t) => t._id === tournamentId);
      setSelectedTournament(tournament);

      // Get participants based on tournament type
      if (tournament) {
        if (tournament.registrationType === "Team") {
          // Filter teams that are approved for this tournament
          const approvedTeamIds = tournament.approvedTeams || [];
          const tournamentTeams = teams?.filter((team) =>
            approvedTeamIds.includes(team._id)
          ) || [];
          setParticipants(tournamentTeams);
        } else if (tournament.registrationType === "Player") {
          // Use approved players from tournament
          const approvedPlayers = tournament.approvedPlayers || [];
          setParticipants(approvedPlayers);
        }
      }
    } else {
      setSelectedTournament(null);
      setParticipants([]);
    }
  }, [tournamentId, tournaments, teams]);

  const onSubmit = async (data) => {
    try {
      const matchData = {
        tournament: data.tournament,
        scheduledAt: data.scheduledAt,
        ground: {
          name: data.groundName || "",
          city: data.groundCity || "",
          address: data.groundAddress || "",
        },
      };

      // Add participants based on tournament type
      if (selectedTournament?.registrationType === "Team") {
        matchData.teamA = data.participantA;
        matchData.teamB = data.participantB;
      } else {
        matchData.playerA = data.participantA;
        matchData.playerB = data.participantB;
      }

      const result = await dispatch(createMatch(matchData)).unwrap();

      if (result) {
        navigate("/organizer/matches");
      }
    } catch (error) {
      console.error("Failed to create match:", error);
    }
  };

  const tournamentOptions = [
    { value: "", label: "Select Tournament" },
    ...(tournaments?.map((tournament) => ({
      value: tournament._id,
      label: `${tournament.name} - ${tournament.sport?.name || ""}`,
    })) || []),
  ];

  const participantOptions = [
    { value: "", label: `Select ${selectedTournament?.registrationType === "Team" ? "Team" : "Player"}` },
    ...(participants?.map((participant) => ({
      value: participant._id,
      label: participant.name || `${participant.firstName} ${participant.lastName}`,
    })) || []),
  ];

  return (
    <div className="space-y-6">
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
            Schedule Match
          </h1>
          <p className="text-base dark:text-base-dark">
            Create a new match for a tournament
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tournament & Participants Card */}
        <div className="bg-card-background dark:bg-card-background-dark rounded-xl border border-base-dark dark:border-base p-6">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-secondary" />
            Match Details
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Select
                label="Tournament"
                options={tournamentOptions}
                {...register("tournament", { required: "Tournament is required" })}
                error={errors.tournament?.message}
                required
              />
            </div>

            {selectedTournament && (
              <>
                <Select
                  label={`${selectedTournament.registrationType === "Team" ? "Team A" : "Player A"}`}
                  options={participantOptions}
                  {...register("participantA", {
                    required: `${selectedTournament.registrationType === "Team" ? "Team A" : "Player A"} is required`,
                  })}
                  error={errors.participantA?.message}
                  required
                />

                <Select
                  label={`${selectedTournament.registrationType === "Team" ? "Team B" : "Player B"}`}
                  options={participantOptions}
                  {...register("participantB", {
                    required: `${selectedTournament.registrationType === "Team" ? "Team B" : "Player B"} is required`,
                  })}
                  error={errors.participantB?.message}
                  required
                />
              </>
            )}

            <div className="md:col-span-2">
              <Input
                label="Scheduled Date & Time"
                type="datetime-local"
                {...register("scheduledAt", {
                  required: "Scheduled date & time is required",
                })}
                error={errors.scheduledAt?.message}
                required
              />
            </div>
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

        {/* Helper Message */}
        {!selectedTournament && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Select a tournament to see available participants
            </p>
          </div>
        )}

        {selectedTournament && participants.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              No approved {selectedTournament.registrationType === "Team" ? "teams" : "players"} found for this tournament. 
              Please approve participants first.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={loading || !selectedTournament || participants.length < 2}
            className="bg-secondary hover:bg-secondary/90"
          >
            {loading ? "Creating..." : "Create Match"}
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

export default CreateMatch;
