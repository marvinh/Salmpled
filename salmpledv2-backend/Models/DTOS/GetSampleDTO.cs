using System.ComponentModel.DataAnnotations;

namespace salmpledv2_backend.Models.DTOS
{
    public class GetSampleDTO : BaseEntity
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public Guid PackId {get;set;}
        public string Region { get; set; }
        public string Bucket { get; set; }
        public string UKey { get; set; }
        public string CKey { get; set; }
        
        public List<GetTagDTO> Tags {get;set;}

        public string MimeType {get;set;}

        public decimal Tempo {get;set;}
        
    }
}