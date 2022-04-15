namespace salmpledv2_backend.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string SubId { get; set; }
        public string Username { get; set; }
        public string Email {get; set;}
        public string? Headline { get; set; }
        public string? Bio { get; set; }

        public List<UserGroup>? UserGroups {get;set;}
        public List<Pack>? Packs {get;set;}

        public long StorageUsedMB {get; set;}
        public long MaxStorageMB {get;set;}
    }
}