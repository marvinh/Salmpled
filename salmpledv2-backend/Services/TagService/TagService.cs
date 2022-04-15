using salmpledv2_backend.Models.ServiceResponse;
using salmpledv2_backend.Models.DTOS;
using salmpledv2_backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
namespace salmpledv2_backend.Services
{
    public class TagService : ITagService
    {
        private readonly MyContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public TagService(MyContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }
        public async Task<ServiceResponse<Tag>> CreateTag(TagDTO TagDTO)
        {

            ServiceResponse<Tag> res = new ServiceResponse<Tag>();

            try
            {
                Tag newTag = new Tag
                {
                    Name = TagDTO.Name
                };
                
                await _context.Tags.AddAsync(newTag);

                await _context.SaveChangesAsync();

                res.Result = newTag;

            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }

            return res;

        }


        public async Task<ServiceResponse<List<Tag>>> TagOptions(TagDTO TagDTO) {
            ServiceResponse<List<Tag>> res = new ServiceResponse<List<Tag>>();

            try
            {

                var query = from Tags in _context.Tags
                            where Tags.Name.Contains(TagDTO.Name)
                            orderby Tags.Name ascending
                            select new Tag{
                                Id = Tags.Id,
                                Name = Tags.Name,
                            };
                            
                res.Result = await query.Take(25).ToListAsync();

            }
            catch (Exception e)
            {
                res.Err = e.Message;
            }

            return res;
        }

    }
}