using Eolobot_Test_3.Models;
using Microsoft.EntityFrameworkCore;

namespace Eolobot_Test_3.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
    }
}