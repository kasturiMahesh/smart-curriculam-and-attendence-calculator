import requests
import sys
import json
from datetime import datetime
import time

class LearnQuestAPITester:
    def __init__(self, base_url="https://learnquest-ai-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.teacher_token = None
        self.student_token = None
        self.teacher_user = None
        self.student_user = None
        self.learning_path_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, message="", response_data=None):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED - {message}")
        else:
            print(f"❌ {name}: FAILED - {message}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "message": message,
            "response_data": response_data
        })

    def make_request(self, method, endpoint, data=None, token=None):
        """Make HTTP request with proper headers"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if token:
            headers['Authorization'] = f'Bearer {token}'
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {str(e)}")
            return None

    def test_health_check(self):
        """Test API health check"""
        print("\n🔍 Testing Health Check...")
        response = self.make_request('GET', 'health')
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('status') == 'healthy':
                self.log_test("Health Check", True, "API is healthy", data)
                return True
            else:
                self.log_test("Health Check", False, f"Unhealthy status: {data}")
        else:
            status_code = response.status_code if response else "No response"
            self.log_test("Health Check", False, f"Status code: {status_code}")
        return False

    def test_teacher_registration(self):
        """Test teacher registration"""
        print("\n🔍 Testing Teacher Registration...")
        timestamp = int(time.time())
        teacher_data = {
            "name": f"Test Teacher {timestamp}",
            "email": f"teacher{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "teacher"
        }
        
        response = self.make_request('POST', 'auth/register', teacher_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('role') == 'teacher':
                self.teacher_user = data
                self.log_test("Teacher Registration", True, f"Teacher registered: {data['name']}", data)
                return True
            else:
                self.log_test("Teacher Registration", False, f"Wrong role: {data}")
        else:
            error_msg = response.json() if response else "No response"
            self.log_test("Teacher Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def test_student_registration(self):
        """Test student registration"""
        print("\n🔍 Testing Student Registration...")
        timestamp = int(time.time())
        student_data = {
            "name": f"Test Student {timestamp}",
            "email": f"student{timestamp}@test.com",
            "password": "TestPass123!",
            "role": "student"
        }
        
        response = self.make_request('POST', 'auth/register', student_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('role') == 'student':
                self.student_user = data
                self.log_test("Student Registration", True, f"Student registered: {data['name']}", data)
                return True
            else:
                self.log_test("Student Registration", False, f"Wrong role: {data}")
        else:
            error_msg = response.json() if response else "No response"
            self.log_test("Student Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def test_teacher_login(self):
        """Test teacher login"""
        print("\n🔍 Testing Teacher Login...")
        if not self.teacher_user:
            self.log_test("Teacher Login", False, "No teacher user to login with")
            return False
        
        login_data = {
            "email": self.teacher_user['email'],
            "password": "TestPass123!"
        }
        
        response = self.make_request('POST', 'auth/login', login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('access_token') and data.get('user'):
                self.teacher_token = data['access_token']
                self.log_test("Teacher Login", True, f"Teacher logged in: {data['user']['name']}", data)
                return True
            else:
                self.log_test("Teacher Login", False, f"Missing token or user data: {data}")
        else:
            error_msg = response.json() if response else "No response"
            self.log_test("Teacher Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def test_student_login(self):
        """Test student login"""
        print("\n🔍 Testing Student Login...")
        if not self.student_user:
            self.log_test("Student Login", False, "No student user to login with")
            return False
        
        login_data = {
            "email": self.student_user['email'],
            "password": "TestPass123!"
        }
        
        response = self.make_request('POST', 'auth/login', login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('access_token') and data.get('user'):
                self.student_token = data['access_token']
                self.log_test("Student Login", True, f"Student logged in: {data['user']['name']}", data)
                return True
            else:
                self.log_test("Student Login", False, f"Missing token or user data: {data}")
        else:
            error_msg = response.json() if response else "No response"
            self.log_test("Student Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def test_create_learning_path(self):
        """Test learning path creation"""
        print("\n🔍 Testing Learning Path Creation...")
        if not self.teacher_token:
            self.log_test("Create Learning Path", False, "No teacher token available")
            return False
        
        path_data = {
            "title": "Python Programming Fundamentals",
            "topic": "Python Programming",
            "duration_days": 5,
            "difficulty_level": "beginner",
            "max_videos_per_day": 3,
            "target_hours_per_day": 2.0,
            "assigned_student_ids": [self.student_user['id']] if self.student_user else []
        }
        
        response = self.make_request('POST', 'learning-paths', path_data, self.teacher_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('id') and data.get('daily_schedule'):
                self.learning_path_id = data['id']
                self.log_test("Create Learning Path", True, f"Learning path created: {data['title']}", data)
                return True
            else:
                self.log_test("Create Learning Path", False, f"Missing required fields: {data}")
        else:
            error_msg = response.json() if response else "No response"
            self.log_test("Create Learning Path", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def test_get_learning_paths(self):
        """Test getting learning paths"""
        print("\n🔍 Testing Get Learning Paths...")
        if not self.teacher_token:
            self.log_test("Get Learning Paths", False, "No teacher token available")
            return False
        
        response = self.make_request('GET', 'learning-paths', token=self.teacher_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Get Learning Paths", True, f"Retrieved {len(data)} learning paths", data)
                return True
            else:
                self.log_test("Get Learning Paths", False, f"Expected list, got: {type(data)}")
        else:
            error_msg = response.json() if response else "No response"
            self.log_test("Get Learning Paths", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def test_update_progress(self):
        """Test progress update"""
        print("\n🔍 Testing Progress Update...")
        if not self.student_token or not self.learning_path_id:
            self.log_test("Update Progress", False, "Missing student token or learning path ID")
            return False
        
        progress_data = {
            "learning_path_id": self.learning_path_id,
            "day_number": 1,
            "video_id": "test_video_123",
            "completed": True,
            "study_time_minutes": 30,
            "notes": "Completed first video successfully"
        }
        
        response = self.make_request('POST', 'progress/update', progress_data, self.student_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if data.get('message') and 'progress_percentage' in data:
                self.log_test("Update Progress", True, f"Progress updated: {data['message']}", data)
                return True
            else:
                self.log_test("Update Progress", False, f"Missing expected fields: {data}")
        else:
            error_msg = response.json() if response else "No response"
            self.log_test("Update Progress", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def test_get_progress(self):
        """Test getting progress"""
        print("\n🔍 Testing Get Progress...")
        if not self.student_token or not self.learning_path_id:
            self.log_test("Get Progress", False, "Missing student token or learning path ID")
            return False
        
        response = self.make_request('GET', f'progress/{self.learning_path_id}', token=self.student_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if 'total_progress_percentage' in data and 'daily_progress' in data:
                self.log_test("Get Progress", True, f"Progress retrieved: {data['total_progress_percentage']}%", data)
                return True
            else:
                self.log_test("Get Progress", False, f"Missing expected fields: {data}")
        else:
            error_msg = response.json() if response else "No response"
            self.log_test("Get Progress", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def test_get_students(self):
        """Test getting students (teacher only)"""
        print("\n🔍 Testing Get Students...")
        if not self.teacher_token:
            self.log_test("Get Students", False, "No teacher token available")
            return False
        
        response = self.make_request('GET', 'students', token=self.teacher_token)
        
        if response and response.status_code == 200:
            data = response.json()
            if isinstance(data, list):
                self.log_test("Get Students", True, f"Retrieved {len(data)} students", data)
                return True
            else:
                self.log_test("Get Students", False, f"Expected list, got: {type(data)}")
        else:
            error_msg = response.json() if response else "No response"
            self.log_test("Get Students", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting LearnQuest AI API Tests...")
        print(f"Testing against: {self.base_url}")
        
        # Test sequence
        tests = [
            self.test_health_check,
            self.test_teacher_registration,
            self.test_student_registration,
            self.test_teacher_login,
            self.test_student_login,
            self.test_create_learning_path,
            self.test_get_learning_paths,
            self.test_update_progress,
            self.test_get_progress,
            self.test_get_students
        ]
        
        for test in tests:
            try:
                test()
                time.sleep(1)  # Small delay between tests
            except Exception as e:
                self.log_test(test.__name__, False, f"Exception: {str(e)}")
        
        # Print summary
        print(f"\n📊 Test Summary:")
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        # Print failed tests
        failed_tests = [result for result in self.test_results if not result['success']]
        if failed_tests:
            print(f"\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['message']}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = LearnQuestAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())