using Eolobot_Test_3.Data;
using Eolobot_Test_3.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Eolobot_Test_3.Controllers
{
    public class AccountController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly PasswordHasher<User> _hasher = new();

        public AccountController(ApplicationDbContext context)
        {
            _context = context;
        }

        // REGISTER
        [HttpGet]
        public IActionResult Register() => View();

        [HttpPost]
        public IActionResult Register(string username, string email, string password)
        {
            if (_context.Users.Any(u => u.Email == email))
            {
                ViewBag.Error = "Email already exists";
                return View();
            }

            var user = new User
            {
                Username = username,
                Email = email
            };

            user.PasswordHash = _hasher.HashPassword(user, password);

            _context.Users.Add(user);
            _context.SaveChanges();

            return RedirectToAction("Login");
        }

        // LOGIN
        [HttpGet]
        public IActionResult Login() => View();

        [HttpPost]
        public IActionResult Login(string email, string password)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                ViewBag.Error = "Invalid login";
                return View();
            }

            var result = _hasher.VerifyHashedPassword(user, user.PasswordHash, password);
            if (result == PasswordVerificationResult.Failed)
            {
                ViewBag.Error = "Invalid login";
                return View();
            }

            HttpContext.Session.SetString("User", user.Username);
            return RedirectToAction("Index", "Home");
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }
    }
}