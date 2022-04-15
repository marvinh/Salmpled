using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace salmpledv2_backend.Models {
    
    public class Genre : BaseEntity {
        public Guid Id {get; set;}
        [MaxLength(64)]
        
        public string Name {get; set;}
        public List<PackGenre>? PackGenres {get; set;}
    }
}