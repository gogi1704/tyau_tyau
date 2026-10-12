import { useEffect } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import HomeScreen from "./screens/HomeScreen";
import ProfileScreen from "./screens/ProfileScreen";
import MapScreen from "./screens/MapScreen";
import SearchScreen from "./screens/SearchScreen";
import MeetupsScreen from "./screens/MeetupsScreen";
import MeetupDetailScreen from "./screens/MeetupDetailScreen";
import ChatsScreen from "./screens/ChatsScreen";
import PublicProfileScreen from "./screens/PublicProfileScreen";
import PeopleScreen from "./screens/PeopleScreen";
import GroupsScreen from "./screens/GroupsScreen";
import GroupDetailScreen from "./screens/GroupDetailScreen";
import BottomNav from "./components/BottomNav";
import MatchModal from "./components/MatchModal";
import ThemeToggle from "./components/ThemeToggle";
import CreateMeetupModal from "./components/CreateMeetupModal";
import CreateGroupModal from "./components/CreateGroupModal";
import CreateChoiceModal from "./components/CreateChoiceModal";
import { getStartParam } from "./lib/telegram";
import { useAppStore } from "./lib/store";

export default function App() {
  const navigate = useNavigate();
  const createMeetupOpen = useAppStore((s) => s.createMeetupOpen);
  const closeCreateMeetup = useAppStore((s) => s.closeCreateMeetup);
  const createGroupOpen = useAppStore((s) => s.createGroupOpen);
  const closeCreateGroup = useAppStore((s) => s.closeCreateGroup);

  useEffect(() => {
    const startParam = getStartParam();
    if (startParam?.startsWith("meetup_")) {
      navigate(`/meetups/${startParam.replace("meetup_", "")}`);
    }
  }, [navigate]);

  return (
    <div className="flex h-screen flex-col bg-[color:var(--tg-bg)]">
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24" style={{ paddingTop: "var(--safe-top)" }}>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/map" element={<MapScreen />} />
          <Route path="/search" element={<SearchScreen />} />
          <Route path="/meetups" element={<MeetupsScreen />} />
          <Route path="/meetups/:id" element={<MeetupDetailScreen />} />
          <Route path="/chats" element={<ChatsScreen />} />
          <Route path="/dog/:id" element={<PublicProfileScreen />} />
          <Route path="/people" element={<PeopleScreen />} />
          <Route path="/groups" element={<GroupsScreen />} />
          <Route path="/groups/:id" element={<GroupDetailScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
      <MatchModal />
      <ThemeToggle />
      <CreateChoiceModal />
      {createMeetupOpen && <CreateMeetupModal onClose={closeCreateMeetup} />}
      {createGroupOpen && <CreateGroupModal onClose={closeCreateGroup} />}
    </div>
  );
}
