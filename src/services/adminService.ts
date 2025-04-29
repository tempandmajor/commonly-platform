
// This file acts as a central export point for all admin services

export {
  getUsers,
  searchUsers,
  updateUser,
  setAdminStatus
} from './admin/userService';

export {
  getAdminEvents,
  getVirtualEvents,
  getLiveEvents,
  likeEvent,
  unlikeEvent,
  shareEvent,
  checkIfUserLiked,
  startStream,
  endStream,
  uploadRecording
} from './admin/event';

export {
  getAdminVenues,
  updateVenueVerification
} from './admin/venueService';

export {
  distributeCredits,
  createCreditsCampaign
} from './admin/creditsService';

export {
  getDashboardMetrics
} from './admin/analyticsService';

export {
  updateContentPage
} from './admin/contentService';

export {
  addArtistProfile,
  uploadArtistImage
} from './admin/artistService';
