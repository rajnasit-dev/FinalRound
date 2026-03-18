import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Edit, Play, Calendar, Users, Ban, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import Spinner from "../../components/ui/Spinner";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import BackButton from "../../components/ui/BackButton";
import MatchDetailModal from "../../components/ui/MatchDetailModal";
import useDateFormat from "../../hooks/useDateFormat";
import useStatusColor from "../../hooks/useStatusColor";
import { fetchTournamentById } from "../../store/slices/tournamentSlice";
import {
  createMatch,
  fetchMatchesByTournament,
  updateMatchStatus,
} from "../../store/slices/matchSlice";

const TournamentFixtures = () => {
  const { tournamentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { formatDate, formatTime } = useDateFormat();
  const { getStatusColor } = useStatusColor();
  const { user } = useSelector((state) => state.auth);
  const { selectedTournament: tournament, loading: tournamentLoading } = useSelector(
    (state) => state.tournament
  );
  const { tournamentMatches: matches, loading: matchesLoading } = useSelector((state) => state.match);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showFixtureSetupModal, setShowFixtureSetupModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("League");
  const [intervalHours, setIntervalHours] = useState(3);
  const [fixtureStartDate, setFixtureStartDate] = useState("");
  const [timeFrom, setTimeFrom] = useState("10:00");
  const [timeTo, setTimeTo] = useState("18:00");
  const [draftFixtures, setDraftFixtures] = useState([]);
  const [knockoutByes, setKnockoutByes] = useState([]);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isFinalizingFixtures, setIsFinalizingFixtures] = useState(false);

  useEffect(() => {
    if (tournamentId) {
      dispatch(fetchTournamentById(tournamentId));
      dispatch(fetchMatchesByTournament(tournamentId));
    }
  }, [dispatch, tournamentId]);

  useEffect(() => {
    if (tournament?.format) {
      setSelectedFormat(tournament.format);
    }
  }, [tournament?.format]);

  // Check if user is the organizer
  const isOrganizer = tournament?.organizer?._id === user?._id;

  const approvedParticipantsCount = tournament?.registrationType === "Player"
    ? tournament?.approvedPlayers?.length || 0
    : tournament?.approvedTeams?.length || 0;

  const teamNameLookup = new Map(
    (tournament?.approvedTeams || []).map((team) => [team?._id?.toString(), team?.name])
  );
  const playerNameLookup = new Map(
    (tournament?.approvedPlayers || []).map((player) => [player?._id?.toString(), player?.fullName])
  );

  const getParticipantName = (participant, type) => {
    if (!participant) return "TBD";

    if (type === "team") {
      if (typeof participant === "object") return participant.name || "TBD";
      return teamNameLookup.get(participant.toString()) || "TBD";
    }

    if (typeof participant === "object") return participant.fullName || participant.name || "TBD";
    return playerNameLookup.get(participant.toString()) || "TBD";
  };

  const canAutoGenerate =
    !tournament?.isScheduleCreated &&
    (matches?.length || 0) === 0 &&
    approvedParticipantsCount >= 2;

  const getNextPowerOfTwo = (value) => {
    let power = 1;

    while (power < value) {
      power *= 2;
    }

    return power;
  };

  const fixtureFormatDescription = tournament?.format === "Knockout"
    ? "Knockout format creates opening-round elimination fixtures. If the bracket is uneven, some participants get a first-round bye."
    : "League format creates round-robin fixtures where every approved participant plays every other participant once.";

  const parseTimeToMinutes = (value) => {
    const [hours, minutes] = value.split(":").map(Number);
    return (hours * 60) + minutes;
  };

  const toDateInputValue = (value) => {
    const date = new Date(value);
    const pad = (num) => String(num).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  };

  const toDateTimeLocalString = (date) => {
    const pad = (num) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const createLeaguePairings = (participants) => {
    const pairings = [];

    for (let i = 0; i < participants.length; i++) {
      for (let j = i + 1; j < participants.length; j++) {
        pairings.push([participants[i], participants[j]]);
      }
    }

    return pairings;
  };

  const createKnockoutPairings = (participants) => {
    const bracketSize = getNextPowerOfTwo(participants.length);
    const byeCount = bracketSize - participants.length;
    const byeParticipants = participants.slice(0, byeCount);
    const remainingParticipants = participants.slice(byeCount);
    const pairings = [];

    for (let i = 0; i < remainingParticipants.length; i += 2) {
      const participantA = remainingParticipants[i];
      const participantB = remainingParticipants[i + 1];

      if (participantA && participantB) {
        pairings.push([participantA, participantB]);
      }
    }

    return { pairings, byeParticipants };
  };

  const scheduleDraftFixtures = (pairings) => {
    const intervalMinutes = Math.max(30, Number(intervalHours) * 60);
    const startDate = new Date(fixtureStartDate || tournament.startDate);
    const startMinutes = parseTimeToMinutes(timeFrom);
    const endMinutes = parseTimeToMinutes(timeTo);

    if (endMinutes <= startMinutes) {
      throw new Error("Time range is invalid. 'To' time must be after 'From' time.");
    }

    const slotsPerDay = Math.max(1, Math.floor((endMinutes - startMinutes) / intervalMinutes) + 1);

    return pairings.map(([participantA, participantB], index) => {
      const dayOffset = Math.floor(index / slotsPerDay);
      const slotOffset = index % slotsPerDay;
      const fixtureDate = new Date(startDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
      const totalMinutesForSlot = startMinutes + (slotOffset * intervalMinutes);
      const fixtureHours = Math.floor(totalMinutesForSlot / 60);
      const fixtureMinutes = totalMinutesForSlot % 60;

      fixtureDate.setHours(fixtureHours, fixtureMinutes, 0, 0);

      return {
        id: `${participantA.id}-${participantB.id}-${index}`,
        participantAId: participantA.id,
        participantBId: participantB.id,
        participantAName: participantA.name,
        participantBName: participantB.name,
        scheduledAt: toDateTimeLocalString(fixtureDate),
      };
    });
  };

  const handleOpenFixtureSetup = () => {
    if (!canAutoGenerate) return;
    setDraftFixtures([]);
    setKnockoutByes([]);
    setSelectedFormat(tournament?.format || "League");
    setIntervalHours(3);
    setFixtureStartDate(toDateInputValue(tournament?.startDate || new Date()));
    setTimeFrom("10:00");
    setTimeTo("18:00");
    setShowFixtureSetupModal(true);
  };

  const handleGenerateDraftFixtures = () => {
    if (!canAutoGenerate) return;

    try {
      setIsGeneratingDraft(true);
      const participants = tournament?.registrationType === "Player"
        ? (tournament?.approvedPlayers || []).map((player) => ({ id: player._id, name: player.fullName }))
        : (tournament?.approvedTeams || []).map((team) => ({ id: team._id, name: team.name }));

      let pairings = [];
      let byes = [];

      if (selectedFormat === "Knockout") {
        const { pairings: knockoutPairings, byeParticipants } = createKnockoutPairings(participants);
        pairings = knockoutPairings;
        byes = byeParticipants;
      } else {
        pairings = createLeaguePairings(participants);
      }

      const generatedDraft = scheduleDraftFixtures(pairings);
      setDraftFixtures(generatedDraft);
      setKnockoutByes(byes);

      const byesText = byes.length > 0 ? ` with ${byes.length} bye(s)` : "";
      toast.success(`Draft created: ${generatedDraft.length} fixtures${byesText}.`);
    } catch (error) {
      toast.error(error?.message || "Failed to generate draft fixtures");
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  const handleDraftTimeChange = (fixtureId, value) => {
    setDraftFixtures((prev) => prev.map((fixture) => (
      fixture.id === fixtureId ? { ...fixture, scheduledAt: value } : fixture
    )));
  };

  const handleRemoveDraftFixture = (fixtureId) => {
    setDraftFixtures((prev) => prev.filter((fixture) => fixture.id !== fixtureId));
  };

  const handleFinalizeFixtures = async () => {
    if (draftFixtures.length === 0) {
      toast.error("Create draft fixtures before finalizing.");
      return;
    }

    const hasEmptyTime = draftFixtures.some((fixture) => !fixture.scheduledAt);
    if (hasEmptyTime) {
      toast.error("Each draft fixture must have a valid schedule date and time.");
      return;
    }

    try {
      setIsFinalizingFixtures(true);

      const sportId = tournament?.sport?._id || tournament?.sport;
      const ground = tournament?.ground || null;

      for (const fixture of draftFixtures) {
        const payload = {
          tournament: tournamentId,
          sport: sportId,
          scheduledAt: new Date(fixture.scheduledAt).toISOString(),
          ground,
        };

        if (tournament?.registrationType === "Player") {
          payload.playerA = fixture.participantAId;
          payload.playerB = fixture.participantBId;
        } else {
          payload.teamA = fixture.participantAId;
          payload.teamB = fixture.participantBId;
        }

        // Sequential creation keeps API load stable and error handling straightforward.
        await dispatch(createMatch(payload)).unwrap();
      }

      toast.success("Final fixtures generated successfully.");
      setShowFixtureSetupModal(false);
      setDraftFixtures([]);
      setKnockoutByes([]);
      dispatch(fetchTournamentById(tournamentId));
      dispatch(fetchMatchesByTournament(tournamentId));
    } catch (error) {
      toast.error(error?.message || error || "Failed to finalize fixtures");
    } finally {
      setIsFinalizingFixtures(false);
    }
  };



  const handleCancelMatch = async (matchId, isCancelled) => {
    const action = isCancelled ? "continue" : "cancel";
    if (!window.confirm(`Are you sure you want to ${action} this match?`)) return;
    
    try {
      await dispatch(updateMatchStatus({ matchId, isCancelled: !isCancelled })).unwrap();
      toast.success(`Match ${isCancelled ? "continued" : "cancelled"} successfully!`);
      dispatch(fetchMatchesByTournament(tournamentId));
    } catch (error) {
      toast.error(error?.message || error || `Failed to ${action} match`);
    }
  };

  if (tournamentLoading || matchesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Tournament not found</h2>
          <Link to="/organizer/tournaments" className="text-secondary hover:underline">
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <div className="container mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          
          <Link to="/organizer/tournaments" className="text-secondary hover:underline">
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  const liveMatches = matches?.filter((m) => m.status === "Live") || [];
  const scheduledMatches = matches?.filter((m) => m.status === "Scheduled") || [];
  const completedMatches = matches?.filter((m) => m.status === "Completed") || [];
  const cancelledMatches = matches?.filter((m) => m.isCancelled || m.status === "Cancelled") || [];

  return (
    <div className="space-y-6">
      <BackButton className="mb-6" />
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
              {tournament.name} - Fixtures
            </h1>
            
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={handleOpenFixtureSetup}
              disabled={!canAutoGenerate}
              className="inline-flex items-center gap-2"
              title={
                approvedParticipantsCount < 2
                  ? "At least 2 approved participants are required"
                  : tournament?.isScheduleCreated || (matches?.length || 0) > 0
                  ? "Fixtures are already created"
                  : "Open auto fixture setup"
              }
            >
              <Play className="w-5 h-5" />
              Auto Generate Setup
            </Button>
            <Button
              onClick={() => navigate(`/organizer/tournaments/${tournamentId}/fixtures/create`)}
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Schedule New Match
            </Button>
          </div>
        </div>
        <p className="text-sm text-base dark:text-base-dark mt-3">
          {fixtureFormatDescription} Auto generation is enabled when at least 2 approved participants exist and no fixtures have been created yet.
        </p>
      </div>

      {/* Tournament Info Card */}
      <div className="bg-card-background dark:bg-card-background-dark rounded-xl p-6 border border-base-dark dark:border-base">
        <div className="grid md:grid-cols-5 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-text-primary dark:text-text-primary-dark mb-1">
              {matches?.length || 0}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Total Matches</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
              {scheduledMatches.length}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Scheduled</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-1">
              {liveMatches.length}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Live Now</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
              {completedMatches.length}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-1">
              {cancelledMatches.length}
            </div>
            <div className="text-sm text-base dark:text-base-dark">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Matches Table */}
      <DataTable
        columns={[
          {
            header: "Date & Time",
            accessor: "scheduledAt",
            render: (match) => (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-base dark:text-base-dark" />
                <div>
                  <div className="text-sm font-medium text-text-primary dark:text-text-primary-dark">
                    {formatDate(match.scheduledAt)}
                  </div>
                  <div className="text-xs text-base dark:text-base-dark">
                    {formatTime(match.scheduledAt)}
                  </div>
                </div>
              </div>
            ),
          },
          {
            header: "Participants",
            accessor: "participants",
            render: (match) => {
              const participantA = match.teamA
                ? getParticipantName(match.teamA, "team")
                : getParticipantName(match.playerA, "player");
              const participantB = match.teamB
                ? getParticipantName(match.teamB, "team")
                : getParticipantName(match.playerB, "player");
              return (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-secondary dark:text-secondary" />
                  <div className="text-sm text-text-primary dark:text-text-primary-dark">
                    {participantA} <span className="text-base dark:text-base-dark">vs</span> {participantB}
                  </div>
                </div>
              );
            },
          },
          {
            header: "Status",
            accessor: "status",
            render: (match) => {
              const statusClass = getStatusColor(match.status);
              return (
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white ${statusClass}`}>
                  {match.status === "Live" && <span className="w-2 h-2 bg-current rounded-full animate-pulse mr-1.5" />}
                  {match.status}
                </span>
              );
            },
          },
          {
            header: "Actions",
            accessor: "actions",
            render: (match) => {
              const isMatchCancelled = match.isCancelled || match.status === "Cancelled";
              const matchStatus = isMatchCancelled ? "Cancelled" : match.status;

              return (
              <div className="flex items-center gap-2">
                {!isMatchCancelled && (
                  <Button
                    variant="info"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/organizer/matches/${match._id}/edit`);
                    }}
                  >
                    <Edit className="w-3.5 h-3.5" />
                    {matchStatus === "Live" ? "Update" : "Edit"}
                  </Button>
                )}
                {(matchStatus === "Scheduled" || matchStatus === "Live") && (
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelMatch(match._id, false);
                    }}
                  >
                    <Ban className="w-3.5 h-3.5" />
                    Cancel
                  </Button>
                )}
                {isMatchCancelled && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancelMatch(match._id, true);
                    }}
                  >
                    Continue
                  </Button>
                )}
              </div>
              );
            },
          },
        ]}
        data={matches || []}
        itemsPerPage={10}
        onRowClick={(match) => setSelectedMatch(match)}
        emptyMessage="No matches scheduled yet. Click 'Schedule New Match' to create your first match."
      />

      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}

      {showFixtureSetupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl bg-card-background dark:bg-card-background-dark border border-base-dark dark:border-base">
            <div className="flex items-center justify-between px-6 py-4 border-b border-base-dark dark:border-base">
              <div>
                <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">Auto Fixture Generator</h2>
                
              </div>
              <button
                type="button"
                onClick={() => setShowFixtureSetupModal(false)}
                className="p-2 rounded-lg hover:bg-base/20 dark:hover:bg-base-dark/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)] space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-text-primary dark:text-text-primary-dark">Format</label>
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="w-full rounded-lg border border-base-dark dark:border-base bg-transparent px-3 py-2"
                  >
                    <option value="League">League</option>
                    <option value="Knockout">Knockout</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-text-primary dark:text-text-primary-dark">Time Interval (hours)</label>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={intervalHours}
                    onChange={(e) => setIntervalHours(Number(e.target.value))}
                    className="w-full rounded-lg border border-base-dark dark:border-base bg-transparent px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1 text-text-primary dark:text-text-primary-dark">Start Date</label>
                  <input
                    type="date"
                    value={fixtureStartDate}
                    onChange={(e) => setFixtureStartDate(e.target.value)}
                    className="w-full rounded-lg border border-base-dark dark:border-base bg-transparent px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 items-start">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-text-primary dark:text-text-primary-dark">Time Interval</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="time"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      className="w-full rounded-lg border border-base-dark dark:border-base bg-transparent px-3 py-2"
                    />
                    <input
                      type="time"
                      value={timeTo}
                      onChange={(e) => setTimeTo(e.target.value)}
                      className="w-full rounded-lg border border-base-dark dark:border-base bg-transparent px-3 py-2"
                    />
                  </div>
                  <p className="text-xs text-base dark:text-base-dark mt-2">
                    Example: schedule fixtures only between 10:00 and 18:00.
                  </p>
                </div>

                <div className="rounded-lg bg-base/20 dark:bg-base-dark/20 p-4 text-sm text-text-primary dark:text-text-primary-dark">
                  <p className="font-semibold mb-2">Scheduling rules</p>
                  <p>
                    Fixtures start from the selected date and continue day by day, scheduled only within the chosen time range using the selected interval.
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-base/20 dark:bg-base-dark/20 p-4 text-sm text-text-primary dark:text-text-primary-dark">
                {selectedFormat === "Knockout"
                  ? "Knockout format creates opening-round elimination fixtures. If the bracket is uneven, some participants get a first-round bye. Auto generation is enabled when at least 2 approved participants exist and no fixtures have been created yet."
                  : "League format creates round-robin fixtures where every approved participant plays every other participant once."}
              </div>

              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDraftFixtures([]);
                    setKnockoutByes([]);
                  }}
                  className="w-auto"
                  disabled={draftFixtures.length === 0}
                >
                  Clear Draft
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleGenerateDraftFixtures}
                  isLoading={isGeneratingDraft}
                  className="w-auto"
                >
                  Create Draft Fixtures
                </Button>
              </div>

              {knockoutByes.length > 0 && (
                <div className="rounded-lg border border-amber-400/40 bg-amber-100/20 dark:bg-amber-900/20 p-4 text-sm">
                  <p className="font-semibold text-amber-700 dark:text-amber-300 mb-2">First-round byes</p>
                  <p className="text-amber-800 dark:text-amber-200">
                    {knockoutByes.map((participant) => participant.name).join(", ")}
                  </p>
                </div>
              )}

              {draftFixtures.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-text-primary dark:text-text-primary-dark">
                    Draft Fixtures ({draftFixtures.length})
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-base-dark dark:border-base">
                    <table className="min-w-full text-sm">
                      <thead className="bg-base/20 dark:bg-base-dark/20">
                        <tr>
                          <th className="text-left px-4 py-3 font-semibold">Participants</th>
                          <th className="text-left px-4 py-3 font-semibold">Scheduled At</th>
                          <th className="text-left px-4 py-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {draftFixtures.map((fixture) => (
                          <tr key={fixture.id} className="border-t border-base-dark/40 dark:border-base/40">
                            <td className="px-4 py-3">
                              {fixture.participantAName} vs {fixture.participantBName}
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="datetime-local"
                                value={fixture.scheduledAt}
                                onChange={(e) => handleDraftTimeChange(fixture.id, e.target.value)}
                                className="rounded-lg border border-base-dark dark:border-base bg-transparent px-3 py-2"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleRemoveDraftFixture(fixture.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      variant="success"
                      onClick={handleFinalizeFixtures}
                      isLoading={isFinalizingFixtures}
                      className="w-auto"
                    >
                      Finalize Fixtures
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentFixtures;
