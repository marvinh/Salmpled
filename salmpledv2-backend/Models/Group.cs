namespace salmpledv2_backend.Models {
    public class Group : BaseEntity {
        public Guid Id {get;set;}

        public List<UserGroup>? UserGroups {get;set;}


    }
}