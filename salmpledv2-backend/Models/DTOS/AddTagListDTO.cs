namespace salmpledv2_backend.Models.DTOS
{
    public class AddTagListDTO
    {
        public List<TagDTO> Tags{get;set;}

        public List<Guid> SampleIds{get;set;}
        
    }
}