using Microsoft.EntityFrameworkCore;
using System.Diagnostics.CodeAnalysis;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
namespace salmpledv2_backend.Models
{

    public class MyContext : DbContext
    {

        private readonly string _username;

        public MyContext(DbContextOptions<MyContext> options, IHttpContextAccessor accessor)
            : base(options)
        {
           var claimsPrincipal = accessor.HttpContext?.User;

        // Get the username claim from the claims principal - if the user is not authenticated the claim will be null
            _username = claimsPrincipal?.Claims?.SingleOrDefault(c => c.Type == "https://myapp.example.com/username")?.Value ?? "Anon";
           
        }

        public override async Task<int> SaveChangesAsync(bool acceptAllChangesOnSuccess, CancellationToken cancellationToken = default)
        {
             var entities = ChangeTracker.Entries().Where(x => x.Entity is BaseEntity && (x.State == EntityState.Added || x.State == EntityState.Modified || x.State == EntityState.Deleted));

            

            foreach (var entity in entities)
            {
                if (entity.State == EntityState.Added)
                {
                    ((BaseEntity)entity.Entity).CreatedDate = DateTime.UtcNow;
                    ((BaseEntity)entity.Entity).CreatedBy = _username;
                }
                else if (entity.State == EntityState.Deleted)
                {
                    ((BaseEntity)entity.Entity).DeletedDate = DateTime.UtcNow;
                    ((BaseEntity)entity.Entity).DeletedBy = _username;
                }
                else
                {
                    ((BaseEntity)entity.Entity).UpdatedDate = DateTime.UtcNow;
                    ((BaseEntity)entity.Entity).UpdatedBy = _username;
                }
            }
            return await base.SaveChangesAsync(acceptAllChangesOnSuccess, cancellationToken);

        }

       


        // private void AddTimestamps()
        // {
        //     var entities = ChangeTracker.Entries().Where(x => x.Entity is BaseEntity && (x.State == EntityState.Added || x.State == EntityState.Modified));

        //     string? SubId = _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        //     User? User = this.Users.FirstOrDefault(u => u.SubId == SubId);

        //     var currentUsername = User != null && !string.IsNullOrEmpty(User.Username) ? User.Username : "Anonymous";

        //     foreach (var entity in entities)
        //     {
        //         if (entity.State == EntityState.Added)
        //         {
        //             ((BaseEntity)entity.Entity).CreatedDate = DateTime.UtcNow;
        //             ((BaseEntity)entity.Entity).CreatedBy = currentUsername;
        //         }
        //         else if (entity.State == EntityState.Deleted)
        //         {
        //             ((BaseEntity)entity.Entity).DeletedDate = DateTime.UtcNow;
        //             ((BaseEntity)entity.Entity).DeletedBy = currentUsername;
        //         }
        //         else
        //         {
        //             ((BaseEntity)entity.Entity).UpdatedDate = DateTime.UtcNow;
        //             ((BaseEntity)entity.Entity).UpdatedBy = currentUsername;
        //         }
        //     }


        // }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<User>()
            .ToTable("Users", b => b.IsTemporal())
            .Property(b => b.MaxStorageMB)
            .HasDefaultValue(1000);

             modelBuilder.Entity<Tag>()
            .ToTable("Tags", b => b.IsTemporal());

            modelBuilder.Entity<Genre>()
            .ToTable("Genres", b => b.IsTemporal());


            modelBuilder
            .Entity<Pack>()
                .ToTable("Packs", b => b.IsTemporal())
                .HasIndex(p => new { p.Name, p.UserId }).IsUnique(true);

            modelBuilder
            .Entity<Sample>()
                .ToTable("Samples", b => b.IsTemporal())
                .HasIndex(p => new { p.Name, p.PackId }).IsUnique(true);

            modelBuilder
            .Entity<SampleTag>()
                .ToTable("SampleTags", b => b.IsTemporal())
                .HasKey(b => new
                {
                    b.SampleId,
                    b.TagId
                });

            modelBuilder
            .Entity<PackGenre>()
            .ToTable("PackGenres", b => b.IsTemporal())
            .HasKey(b => new
            {
                b.PackId,
                b.GenreId
            });

            modelBuilder.Entity<UserGroup>()
            .ToTable("UserGroups", b => b.IsTemporal())
            .HasKey(
                b => new
                {
                    b.UserId,
                    b.GroupId
                }
            );

           

        }
        public DbSet<User> Users { get; set; }
        public DbSet<Sample> Samples { get; set; }

        public DbSet<SampleTag> SampleTags { get; set; }

        public DbSet<Pack> Packs { get; set; }

        public DbSet<Genre> Genres { get; set; }

        public DbSet<PackGenre> PackGenres { get; set; }

        public DbSet<Tag> Tags {get;set;}

        public DbSet<UserGroup> UserGroups {get;set;}


    }


}