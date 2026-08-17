import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';
import { Plus, Search } from 'lucide-react';

const ManageStudents = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [search, setSearch] = useState('');
  
  const currentYear = new Date().getFullYear();
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    course: '',
    yearEnrolled: currentYear,
    section: 'A'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, coursesRes] = await Promise.all([
        api.get('/students'),
        api.get('/librarian/courses')
      ]);
      setStudents(studentsRes.data.data);
      setCourses(coursesRes.data.data);
      if (coursesRes.data.data.length > 0) {
        setNewStudent(prev => ({ ...prev, course: coursesRes.data.data[0]._id }));
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students');
      setStudents(res.data.data);
    } catch (err) {
      toast.error('Failed to load students');
    }
  };


  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students', newStudent);
      toast.success('Student added successfully');
      setShowAddStudent(false);
      setNewStudent({
        name: '', email: '', phone: '', studentId: '', course: courses.length > 0 ? courses[0]._id : '', yearEnrolled: currentYear, section: 'A'
      });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error adding student');
    }
  };

  const [filterCourse, setFilterCourse] = useState('');
  const [sortBy, setSortBy] = useState('name');

  const uniqueCourses = Array.from(new Set(students.map(s => s.course?.name).filter(Boolean)));

  const processedStudents = students
    .filter(s => 
      (s.name.toLowerCase().includes(search.toLowerCase()) || 
       (s.studentId && s.studentId.toLowerCase().includes(search.toLowerCase()))) &&
      (filterCourse === '' || s.course?.name === filterCourse)
    )
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rollNo') return (a.studentId || '').localeCompare(b.studentId || '');
      if (sortBy === 'yearEnrolled') return (b.yearEnrolled || 0) - (a.yearEnrolled || 0);
      return 0;
    });

  return (
    <div className="min-h-screen pt-24 pb-12 px-container-padding-mobile md:px-container-padding-desktop z-10 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-gray-900 dark:text-on-background">Manage Students</h1>
            <p className="text-gray-600 dark:text-on-surface-variant mt-2">View and add student accounts.</p>
          </div>
          <button 
            onClick={() => setShowAddStudent(!showAddStudent)}
            className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            {showAddStudent ? 'Cancel' : <><Plus size={20} /> Add Student</>}
          </button>
        </div>

        {showAddStudent && (
          <div className="glass-panel p-8 rounded-2xl mb-8 fade-in-up">
            <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-on-background">New Student Account</h2>
            <form onSubmit={handleAddStudent} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="text" placeholder="Full Name" required className="glass-input px-4 py-3 rounded-lg w-full" value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})} />
              <input type="email" placeholder="Email Address" required className="glass-input px-4 py-3 rounded-lg w-full" value={newStudent.email} onChange={e => setNewStudent({...newStudent, email: e.target.value})} />
              <input type="tel" placeholder="Phone Number" required className="glass-input px-4 py-3 rounded-lg w-full" value={newStudent.phone} onChange={e => setNewStudent({...newStudent, phone: e.target.value})} />
              <input type="text" placeholder="Roll Number (Student ID)" required className="glass-input px-4 py-3 rounded-lg w-full" value={newStudent.studentId} onChange={e => setNewStudent({...newStudent, studentId: e.target.value})} />
              
              <select required className="glass-input px-4 py-3 rounded-lg w-full appearance-none bg-transparent text-gray-900 dark:text-on-background" value={newStudent.course} onChange={e => setNewStudent({...newStudent, course: e.target.value})}>
                <option value="" disabled className="text-black">Select Course</option>
                {courses.map(c => (
                  <option key={c._id} value={c._id} className="text-black">{c.name}</option>
                ))}
              </select>
              
              <select required className="glass-input px-4 py-3 rounded-lg w-full appearance-none bg-transparent text-gray-900 dark:text-on-background" value={newStudent.yearEnrolled} onChange={e => setNewStudent({...newStudent, yearEnrolled: e.target.value})}>
                <option value="" disabled className="text-black">Select Enrollment Year</option>
                {Array.from({length: 10}, (_, i) => currentYear - i).map(year => (
                  <option key={year} value={year} className="text-black">{year}</option>
                ))}
              </select>
              
              <select required className="glass-input px-4 py-3 rounded-lg w-full appearance-none bg-transparent text-gray-900 dark:text-on-background" value={newStudent.section} onChange={e => setNewStudent({...newStudent, section: e.target.value})}>
                <option value="" disabled className="text-black">Select Section</option>
                <option value="A" className="text-black">Section A</option>
                <option value="B" className="text-black">Section B</option>
                <option value="C" className="text-black">Section C</option>
                <option value="D" className="text-black">Section D</option>
              </select>
              
              <div className="md:col-span-2">
                <button type="submit" className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold hover:opacity-90">Create Student</button>
              </div>
            </form>
          </div>
        )}

        <div className="glass-panel rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 flex items-center gap-3 w-full bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-4 py-2 focus-within:border-primary/50 transition-colors">
            <Search className="text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or roll number..." 
              className="bg-transparent border-none outline-none w-full text-gray-900 dark:text-on-background py-1"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex w-full md:w-auto gap-4">
            <select 
              className="glass-input px-4 py-3 rounded-lg bg-transparent text-gray-900 dark:text-on-background flex-1 md:w-48 appearance-none cursor-pointer"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="" className="text-black">All Courses</option>
              {uniqueCourses.map(c => (
                <option key={c} value={c} className="text-black">{c}</option>
              ))}
            </select>
            
            <select 
              className="glass-input px-4 py-3 rounded-lg bg-transparent text-gray-900 dark:text-on-background flex-1 md:w-48 appearance-none cursor-pointer"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name" className="text-black">Sort by Name</option>
              <option value="rollNo" className="text-black">Sort by Roll No</option>
              <option value="yearEnrolled" className="text-black">Sort by Year Enrolled</option>
            </select>
          </div>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.04)] dark:shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-black/10 dark:border-white/10 text-gray-500 dark:text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider bg-gray-100 dark:bg-black/10">
                  <th className="py-4 px-6 font-semibold">Roll No.</th>
                  <th className="py-4 px-6 font-semibold">Name</th>
                  <th className="py-4 px-6 font-semibold">Course</th>
                  <th className="py-4 px-6 font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {loading ? (
                  <tr><td colSpan="4" className="py-8 text-center text-gray-500">Loading students...</td></tr>
                ) : processedStudents.length === 0 ? (
                  <tr><td colSpan="4" className="py-8 text-center text-gray-500">No students found matching your criteria.</td></tr>
                ) : (
                  processedStudents.map(student => (
                    <tr key={student._id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                      <td className="py-4 px-6 font-medium text-primary dark:text-primary-fixed">{student.studentId}</td>
                      <td className="py-4 px-6 text-gray-900 dark:text-on-background">
                        <div className="font-medium group-hover:text-primary dark:group-hover:text-primary-fixed transition-colors">{student.name}</div>
                        <div className="text-xs text-gray-500 dark:text-on-surface-variant mt-1">{student.yearEnrolled} - Section {student.section || 'N/A'}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-on-surface-variant">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-tertiary/10 text-tertiary dark:text-tertiary-fixed border border-tertiary/20">
                          {student.course?.name || student.course || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-600 dark:text-on-surface-variant">
                        <div><span className="font-semibold text-xs text-gray-500 uppercase tracking-wider mr-1">Email:</span> {student.email}</div>
                        <div className="text-xs mt-1"><span className="font-semibold text-gray-500 uppercase tracking-wider mr-1">Phone:</span> {student.phone}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageStudents;
