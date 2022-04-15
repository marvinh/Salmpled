
namespace salmpledv2_backend.Models.DTOS
{
    public class CreatePackDTO
    {
        public string Name { get; set; }

        public string? Description {get; set;}

        public List<GenreDTO>? Genres {get;set;}
        
    }
}