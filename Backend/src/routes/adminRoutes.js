const express = require('express');
const { getLibrarians, createLibrarian, getSettings, updateSettings, getAllUsers, createUser, updateUser, deleteUser, toggleUserSuspension, bulkCreateUsers } = require('../controllers/adminController');
const { getDepartments, createDepartment, updateDepartment, deleteDepartment } = require('../controllers/departmentController');
const { getCourses, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');
const { getAnalytics, exportOverdueReport } = require('../controllers/reportController');
const { getAllLogs, getUserLogs } = require('../controllers/activityController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.route('/librarians')
  .get(getLibrarians)
  .post(createLibrarian);

router.route('/users')
  .get(getAllUsers)
  .post(createUser);
router.route('/users/bulk')
  .post(bulkCreateUsers);
router.route('/users/:id')
  .put(updateUser)
  .delete(deleteUser);
router.route('/users/:id/suspend')
  .put(toggleUserSuspension);
router.route('/users/:id/logs')
  .get(getUserLogs);

router.route('/settings')
  .get(getSettings)
  .put(updateSettings);

router.route('/departments')
  .get(getDepartments)
  .post(createDepartment);
router.route('/departments/:id')
  .put(updateDepartment)
  .delete(deleteDepartment);

router.route('/courses')
  .get(getCourses)
  .post(createCourse);
router.route('/courses/:id')
  .put(updateCourse)
  .delete(deleteCourse);

router.route('/reports/analytics')
  .get(getAnalytics);
router.route('/reports/export/overdue')
  .get(exportOverdueReport);

router.route('/logs')
  .get(getAllLogs);

module.exports = router;
