namespace salmpledv2_backend.Models.DTOS
{
    public class AddCollabDTO
    {
        public List<Guid> UserIds {get;set;}
        public Guid PackId {get;set;}
    }
}