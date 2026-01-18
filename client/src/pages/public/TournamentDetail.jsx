import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTournamentById } from "../../store/slices/tournamentSlice";
import { fetchMatchesByTournament } from "../../store/slices/matchSlice";
import CardStat from "../../components/ui/CardStat";
import Container from "../../components/container/Container";
import Spinner from "../../components/ui/Spinner";
import MatchCard from "../../components/ui/MatchCard";
import GridContainer from "../../components/ui/GridContainer";
import {
  MapPin,
  Users,
  Trophy,
  Calendar,
  UserCheck,
  Clock,
  Mail,
  Phone,
  CheckCircle2,
  IndianRupeeIcon,
} from "lucide-react";
import useDateFormat from "../../hooks/useDateFormat";
import useStatusColor from "../../hooks/useStatusColor";

const TournamentDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { formatDate } = useDateFormat();
  const { getStatusColor } = useStatusColor();

  const { selectedTournament: tournament, loading, error } = useSelector(
    (state) => state.tournament
  );
  
  const { matches: tournamentMatches, loading: matchesLoading } = useSelector(
    (state) => state.match
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchTournamentById(id));
    dispatch(fetchMatchesByTournament(id));
  }, [dispatch, id]);

  // Helper function to check if registration is open
  const isRegistrationOpen = (tournament) => {
    if (!tournament?.registrationStart || !tournament?.registrationEnd) return false;
    const currentDate = new Date();
    const startDate = new Date(tournament.registrationStart);
    const endDate = new Date(tournament.registrationEnd);
    return currentDate >= startDate && currentDate <= endDate;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Tournament</h2>
          <p className="text-gray-600">{error || "Tournament not found"}</p>
          <Link to="/tournaments" className="mt-4 inline-block text-blue-600 hover:underline">
            Back to Tournaments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16">
      {/* Banner */}
      <div className="relative h-screen sm:h-[450px] overflow-hidden">
        <img
          src={tournament.bannerUrl || "https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&h=500&fit=crop"}
          alt={tournament.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black via-black/70 to-black/30"></div>

        {/* Tournament Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-6 pb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            {/* Left Overlay */}
            <div className="flex-1">
              {/* Badges */}
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <p
                  className={`${getStatusColor(
                    tournament.status
                  )} text-white text-xs sm:text-sm px-4 py-1.5 rounded-full font-semibold flex items-center gap-2 shadow-lg`}
                >
                  {tournament.status === "Live" && (
                    <p className="w-2 h-2 bg-white rounded-full animate-pulse"></p>
                  )}
                  {tournament.status}
                </p>
                <p className="bg-accent text-text-primary text-xs sm:text-sm px-4 py-1.5 rounded-full font-bold shadow-lg">
                  {tournament.sport?.name || tournament.sport}
                </p>
                <p className="bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm px-4 py-1.5 rounded-full font-medium">
                  {tournament.registrationType} Registration
                </p>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                {tournament.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-white/90">
                <MapPin className="w-5 h-5 text-accent" />
                <p className="font-medium">{tournament.ground.city}</p>
              </div>
            </div>

            {/* Right Overlay - Registration Button */}
            {isRegistrationOpen(tournament) && (
              <Link
                to={`/tournaments/${id}/register`}
                className="bg-accent hover:bg-accent/90 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-2xl hover:shadow-accent/50 hover:scale-105 whitespace-nowrap inline-block"
              >
                Register Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 mt-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Tournament */}
            {tournament.description && (
              <Container>
                <h2 className="text-2xl font-bold mb-3">About Tournament</h2>
                <p className="text-base dark:text-base-dark leading-relaxed">
                  {tournament.description}
                </p>
              </Container>
            )}

            {/* Tournament Details */}
            <Container>
              <h2 className="text-2xl font-bold mb-5">Tournament Details</h2>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                <CardStat
                  Icon={Calendar}
                  iconColor="text-cyan-700"
                  label="Format"
                  value={tournament.format}
                />
                <CardStat
                  Icon={UserCheck}
                  iconColor="text-purple-600"
                  label="Registration Type"
                  value={`${tournament.registrationType} Based`}
                />
                <CardStat
                  Icon={MapPin}
                  iconColor="text-red-600"
                  label="Location"
                  value={tournament.ground.city}
                />
                <CardStat
                  Icon={Users}
                  iconColor="text-yellow-600"
                  label="Team Limit"
                  value={tournament.teamLimit}
                />
                <CardStat
                  Icon={Users}
                  iconColor="text-orange-600"
                  label="Players Per Team"
                  value={tournament.playersPerTeam}
                />
                <CardStat
                  Icon={Clock}
                  iconColor="text-green-600"
                  label="Entry Fee"
                  value={`₹${tournament.entryFee?.toLocaleString()}`}
                />
                <CardStat
                  Icon={IndianRupeeIcon}
                  iconColor="text-emerald-600"
                  label="Prize Pool"
                  value={`₹${tournament.prizePool?.toLocaleString()}`}
                />
                <CardStat
                  Icon={CheckCircle2}
                  iconColor="text-blue-600"
                  label="Registered teams"
                  value={tournament.registeredTeams?.length || 0}
                />
                <CardStat
                  Icon={CheckCircle2}
                  iconColor="text-emerald-600"
                  label="Approved teams"
                  value={tournament.approvedTeams?.length || 0}
                />
              </div>
            </Container>

            {/* Tournament Timeline */}
            <Container>
              <h2 className="text-2xl font-bold mb-5">Important Dates</h2>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Registration Period */}
                <CardStat
                  Icon={Clock}
                  iconColor="text-blue-700"
                  label="Registration Period"
                  value={`${formatDate(
                    tournament.registrationStart
                  )} - ${formatDate(tournament.registrationEnd)}`}
                />
                {/* Tournament Duration */}
                <CardStat
                  Icon={Calendar}
                  iconColor="text-green-700"
                  label="Tournament Duration"
                  value={`${formatDate(tournament.startDate)} - ${formatDate(
                    tournament.endDate
                  )}`}
                />
              </div>
            </Container>

            {/* Venue Information */}
            {tournament.ground && (
              <Container>
                <h2 className="text-2xl font-bold mb-3">Venue</h2>
                <h3 className="font-bold text-xl mb-2">
                  {tournament.ground.name}
                </h3>
                <p className="text-base dark:text-base-dark mb-1">
                  {tournament.ground.city}
                </p>
                <p className="text-sm text-base dark:text-base-dark">
                  {tournament.ground.address}
                </p>
              </Container>
            )}

            {/* Rules & Regulations */}
            {tournament.rules && tournament.rules.length > 0 && (
              <Container>
                <h2 className="text-2xl font-bold mb-3">Rules & Regulations</h2>
                {tournament.rules.map((rule, index) => (
                  <div key={index} className="flex items-center m-3">
                    <span className="font-medium text-sm">{index + 1}</span>
                    <p className="text-base dark:text-base-dark ml-3 ">
                      {rule}
                    </p>
                  </div>
                ))}
              </Container>
            )}

            {/* Organizer Info */}
            {tournament.organizer && (
              <Container>
                <h2 className="text-2xl font-bold mb-3">Organized By</h2>

                <h3 className="font-bold text-xl mb-2">
                  {tournament.organizer.fullName || tournament.organizer.orgName}
                </h3>
                <div className="space-y-2 text-sm text-base dark:text-base-dark">
                  {tournament.organizer.email && (
                    <a
                      href={`mailto:${tournament.organizer.email}`}
                      className="flex items-center gap-2 hover:text-secondary dark:hover:text-accent transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      {tournament.organizer.email}
                    </a>
                  )}
                  {tournament.organizer.phone && (
                    <a
                      href={`tel:${tournament.organizer.phone}`}
                      className="flex items-center gap-2 hover:text-secondary dark:hover:text-accent transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      {tournament.organizer.phone}
                    </a>
                  )}
                </div>
              </Container>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Container className="border-2 sticky top-20">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-full mb-4">
                  <IndianRupeeIcon className="w-5 h-5" />
                  <p className="font-semibold text-2xl">
                    {tournament.entryFee?.toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-base dark:text-base-dark">
                  Entry Fee
                </p>
              </div>

              {/* Prize Pool */}
              <div className="bg-linear-to-br from-secondary/50 to-secondary/20 p-4 rounded-lg mb-6 border border-secondary/20">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Trophy className="w-6 h-6" />
                  <span className="text-sm">Prize Pool</span>
                </div>
                <div className="text-3xl flex items-center justify-center gap-2 mb-1">
                  <IndianRupeeIcon className="w-7 h-7" />
                  {tournament.prizePool?.toLocaleString()}
                </div>
              </div>

              {/* Teams Registered */}
              <div className="bg-secondary/30 dark:bg-secondary/50 p-4 rounded-lg mb-6 border border-base-dark/10 dark:border-base/10">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-6 h-6" />
                  <span className="text-sm">Registered Teams</span>
                </div>
                <div className="text-center">
                  <span className="font-bold text-2xl">
                    {tournament.registeredTeams?.length || 0}/{tournament.teamLimit}
                  </span>
                  <span className="text-sm text-base dark:text-base-dark ml-2">
                    {tournament.registrationType}s
                  </span>
                </div>
              </div>

              {/* Registration Status */}
              {isRegistrationOpen(tournament) ? (
                <>
                  <Link
                    to={`/tournaments/${id}/register`}
                    className="block w-full text-text-secondary dark:text-text-secondary-dark bg-secondary hover:bg-secondary/90 dark:bg-accent dark:hover:bg-accent/90 text-center px-6 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 mb-3"
                  >
                    Register Now
                  </Link>
                  <p className="text-xs text-center text-base dark:text-base-dark">
                    Registration closes on{" "}
                    {formatDate(tournament.registrationEnd)}
                  </p>
                </>
              ) : (
                <div className="bg-base-dark/70 dark:bg-base/70 text-center py-4 rounded-lg border border-base-dark dark:border-base">
                  <p className="font-semibold text-base dark:text-base-dark">
                    Registration Closed
                  </p>
                </div>
              )}
            </Container>
          </div>
        </div>
        
        {/* Tournament Fixtures Section */}
        {tournamentMatches && tournamentMatches.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-6">
              Tournament Fixtures
            </h2>
              
              {matchesLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="md" />
                </div>
              ) : (
                <div>
                  {/* Live Matches */}
                  {tournamentMatches.filter(m => m.status === "Live").length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-4 flex items-center gap-2">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        Live Now
                      </h3>
                      <GridContainer cols={4}>
                        {tournamentMatches
                          .filter(m => m.status === "Live")
                          .map((match) => (
                            <MatchCard key={match._id} match={match} />
                          ))}
                      </GridContainer>
                    </div>
                  )}

                  {/* Upcoming Matches */}
                  {tournamentMatches.filter(m => m.status === "Scheduled").length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-4">
                        Upcoming Matches
                      </h3>
                      <GridContainer cols={4}>
                        {tournamentMatches
                          .filter(m => m.status === "Scheduled")
                          .map((match) => (
                            <MatchCard key={match._id} match={match} />
                          ))}
                      </GridContainer>
                    </div>
                  )}

                  {/* Completed Matches */}
                  {tournamentMatches.filter(m => m.status === "Completed").length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold text-text-primary dark:text-text-primary-dark mb-4">
                        Completed Matches
                      </h3>
                      <GridContainer cols={4}>
                        {tournamentMatches
                          .filter(m => m.status === "Completed")
                          .slice(0, 6)
                          .map((match) => (
                            <MatchCard key={match._id} match={match} />
                          ))}
                      </GridContainer>
                    </div>
                  )}
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentDetail;
