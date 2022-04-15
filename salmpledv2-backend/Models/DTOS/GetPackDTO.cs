
namespace salmpledv2_backend.Models.DTOS
{
    public class GetPackDTO : BaseEntity
    {
        
        public Guid Id {get;set;}

        public string Name {get;set;}

        public GetUserDTO User {get; set;}

        public List<GetSampleDTO> Samples {get;set;}

        public List<GetGenreDTO> Genres {get;set;}

        public string Slug {get;set;}

        public string Description {get;set;}

        
        public List<GetUserDTO> Collaborators{get;set;}


    }
}